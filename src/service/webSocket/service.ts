import ReconnectingWebSocket from 'reconnecting-websocket'
import type { IAggregateData, ISummaryData, IPingData } from './types'
import { genAuthReqId } from '@/utils';

export const WSS_URL = import.meta.env.VITE_WSS_URL

function replaceAfterSecondDot(str: string) {
  return str.replace(/^([^.]*\.[^.]*)\.(.*)$/, '$1.*');
}
function processType(type: string) {
  const parts = type.split('.');

  if (parts.length < 3) {
    return {
      original: type,
      replaced: type,
      extracted: parts[parts.length - 1] || ''
    };
  }

  const replaced = parts.slice(0, 2).join('.') + '.*';
  const extracted = parts.slice(2).join('.');

  return {
    original: type,
    replaced: replaced,
    extracted: extracted
  };
}

export interface WSMessage {
  request: string
  args: any
  requestId?: string
}

export interface ResMessage<T extends EventType> {
  type: T
  data: EventDataMap[T]
}

export type EventType = 'summary' | 'aggregate' | 'ping' | 'auth' | string

type EventDataMap = {
  summary: ISummaryData
  aggregate: IAggregateData
  ping: IPingData
  auth: IPingData
  [key: string]: any
}

type Listener<T extends EventType> = (data: ResMessage<T>['data']) => void

interface WSOptions {
  url?: string
  maxRetries?: number
  minReconnectionDelay?: number
  maxReconnectionDelay?: number
}

class WebSocketService {
  private static instance: WebSocketService
  private ws: ReconnectingWebSocket | null = null
  private listeners: Map<EventType | string, Set<Listener<EventType>>> = new Map()
  private authListeners: Map<string, Listener<string>> = new Map()
  private subscriptions: Set<EventType | string> = new Set()
  private url: string = ''
  private options?: WSOptions
  private pendingQueue: WSMessage[] = []
  private authStatus: boolean = false
  private authSignture: string = ''
  /** 单例获取 */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  /** 初始化, 只允许初始化一次*/
  public init(options: WSOptions) {
    if (this.ws) {
      return
    }

    this.url = options.url || WSS_URL
    this.options = options

    this.ws = new ReconnectingWebSocket(this.url, [], {
      maxRetries: options.maxRetries ?? 10,
      minReconnectionDelay: options.minReconnectionDelay ?? 3000,
      maxReconnectionDelay: options.maxReconnectionDelay ?? 10000,
      reconnectionDelayGrowFactor: 1.3,
    })

    this.bindEvents()
  }

  public auth(signture: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const auth = { request: 'auth', args: signture }
      this.ws.send(JSON.stringify(auth))
    } else {
      this.authSignture = signture
    }
  }

  private ensureInitialized() {
    if (!this.ws) {
      this.init({})
    }
  }

  /** 绑定事件 */
  private bindEvents() {
    // if (!this.ws) return;
    this.ensureInitialized()
    // 避免重复访问 this 属性
    const ws = this.ws!

    ws.addEventListener('open', () => {
      console.log('WebSocket connected:', this.url)
      // 发送缓存消息
      this.pendingQueue.forEach(msg => this.send(msg))
      this.pendingQueue = []
      this.resubscribeAll()
      if (this.authSignture) {
        this.auth(this.authSignture)
        this.authSignture = ''
      }
    })

    ws.addEventListener('message', this.handleMessageBound)

    ws.addEventListener('close', () => {
      console.log('🔌 WebSocket disconnected')
    })

    ws.addEventListener('error', err => {
      console.error('WebSocket error:', err)
    })
  }
  private handleMessageBound = (event: MessageEvent) => this.handleMessage(event.data)
  /** 处理消息 */
  private handleMessage(raw: any) {
    try {
      const data = JSON.parse(raw) as ResMessage<EventType>
      if (data.type === 'ping') {
        this.replyPong(data as ResMessage<'ping'>)
        return
      }
      if (data.type === 'auth') {
        this.authStatus = true
        // 所有缓存的订单相关的订阅全部重新订阅
        this.resubscribeAll()

        // 调用认证监听器
        const requestId = data.data.data
        const authListener = this.authListeners.get(requestId)
        if (authListener) {
          authListener(data.data)
          this.authListeners.delete(requestId)
        }

        return
      }
      this.dispatch(data)
    } catch (err) {
      console.warn(' WS parse error:', err, raw)
    }
  }

  /** 自动回复 pong */
  private replyPong(pingData: ResMessage<'ping'>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const pong = { request: 'pong', args: { ts: Date.now() } }
      this.ws.send(JSON.stringify(pong))
    }
  }

  /** 分发事件 */
  private dispatch(data: ResMessage<EventType>) {
    // 调用对应事件监听器
    const listeners = this.listeners.get(data.type)
    if (listeners) {
      listeners.forEach(cb => cb(data.data))
    }
    // order.97.*订阅，也会返回order.97.COINc数据，特殊处理
    if (data.type.indexOf('order.') === 0) {
      const typeInfo = processType(data.type)
      const listenersOrder = this.listeners.get(typeInfo.replaced)

      if (listenersOrder) {
        data.data.sl = typeInfo.extracted
        listenersOrder.forEach(cb => cb(data.data))
      }
    }
  }

  /** 发送数据 */
  private send(data: WSMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))

    } else {
      this.pendingQueue.push(data)
    }
  }

  /** 重连后恢复订阅 */
  private resubscribeAll() {
    if (this.subscriptions.size === 0) return
    console.log('🔁 Resubscribing channels...')
    // 批量一次性订阅所有 topic
    this.send({ request: 'sub', args: [...this.subscriptions] })
  }

  public onAuth(signature: string, listener: Listener<string>) {
    // 每次发送 auth 请求时，都生成一个新的 requestId
    const requestId = genAuthReqId()
    // 存储 auth 监听器
    this.authListeners.set(requestId, listener)

    this.send({ request: 'auth', args: signature, requestId })
  }

  public on<T extends EventType>(eventType: T | string, listener: Listener<T>) {
    this.ensureInitialized()

    // 检查是否是第一个监听器
    const isFirstListener =
      !this.listeners.has(eventType) || this.listeners.get(eventType)!.size === 0

    // 添加监听器
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }

    const listenerSet = this.listeners.get(eventType)! as Set<Listener<T>>
    listenerSet.add(listener)

    // 如果是第一个监听器，自动订阅
    if (isFirstListener) {
      this.subscribe(eventType)
    }
  }

  private subscribe(topic: EventType | EventType[] | string) {
    const topicList = Array.isArray(topic) ? topic : [topic]
    // 过滤出不在 subscriptions 中的新 topic
    const newTopics = topicList.filter(t => !this.subscriptions.has(t))

    if (newTopics.length === 0) {
      console.log('所有 topic 已订阅，无需重复:', topicList)
      return
    }

    // 只订阅新的 topic
    // 批量一次性订阅新 topic
    newTopics.forEach(t => {
      this.subscriptions.add(t)
    })
    this.send({ request: 'sub', args: newTopics })
  }

  private unsubscribe(topic: EventType | EventType[] | string | string[]) {
    const topicList = Array.isArray(topic) ? topic : [topic]
    // 过滤出在 subscriptions 中的 topic
    const validTopics = topicList.filter(t => this.subscriptions.has(t))

    if (validTopics.length === 0) {
      console.log('所有 topic 已取消订阅，无需重复:', topicList)
      return
    }

    // 只取消订阅在 subscriptions 中的 topic
    // 批量一次性取消订阅
    validTopics.forEach(t => {
      this.subscriptions.delete(t)
    })
    // 一次性发送取消订阅请求
    this.send({ request: 'unsub', args: validTopics })
  }

  /** 移除事件监听 */
  public off<T extends EventType>(eventType: T, listener: Listener<T>) {
    if (!this.listeners.has(eventType)) return
    // 移除监听器
    const listenerSet = this.listeners.get(eventType)! as Set<Listener<T>>
    listenerSet.delete(listener)

    // 检查是否还有监听器
    const hasListeners = listenerSet.size > 0
    // 如果没有监听器了，自动取消订阅
    if (!hasListeners) {
      this.unsubscribe(eventType)
    }
  }

  /** 移除所有事件监听 */
  private removeAllListeners() {
    this.listeners.clear()
  }

  /** 移除所有订阅（并通知服务端） */
  public clearSubscriptions() {
    this.unsubscribe(Array.from(this.subscriptions))
  }

  /** 主动关闭连接 */
  public close() {
    this.removeAllListeners()
    this.clearSubscriptions()
    this.ws?.removeEventListener('message', this.handleMessageBound)
    this.ws?.close()
    this.ws = null
    console.log('🧹 WebSocket closed manually')
  }
}

// 导出单例
const wsService = WebSocketService.getInstance()
export default wsService
