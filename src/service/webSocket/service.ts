import ReconnectingWebSocket from 'reconnecting-websocket'
import type { IAggregateData, ISummaryData, IPingData, IAuthData, ISubData, IUnsubData, IOrderData } from './types'

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

  // 替换第三个点后的内容为通配符，例如将 order.123456.Applc 替换为 order.123456.*
  const replaced = parts.slice(0, 2).join('.') + '.*';
  // 提取第三个点后的内容，例如将 order.123456.Applc 提取为 Applc
  const extracted = parts.slice(2).join('.');

  return {
    original: type,
    replaced: replaced,
    extracted: extracted
  };
}

// 客户端可以向 WebSocket 服务端请求的事件类型
export type RequestEventType = 'sub' | 'unsub' | 'auth' | 'pong'

// 客户端发送给 WebSocket 服务端的请求消息结构
export interface WSRequestMessage<T extends RequestEventType> {
  request: T
  args?: any
  requestId?: number
}

// 客户端从 WebSocket 服务端接收的响应消息结构
export interface ResMessage<T extends ResEventType> {
  type: T
  requestId: number
  data: ResEventDataMap[T]
}

// 事件类型核心定义 (Source of Truth) 

// 订单相关事件的模板字面量类型
export type OrderEventType = `order.${number}.${string}`

/**
 * 所有客户端可以**订阅**的事件及其 `data` 载荷的类型映射。
 * 这是所有“可订阅事件”的“真实数据源”。
 * `SubscribedEventType` 会从此类型自动派生。
 */
export type SubscribableEventDataMap = {
  summary: ISummaryData
  aggregate: IAggregateData
  auth: IAuthData // auth 是一个特殊的可订阅事件，通常只触发一次
} & {
  [key: OrderEventType]: IOrderData
}

/**
 * 所有 WebSocket 响应事件及其 `data` 的类型映射。
 * 这是所有“响应事件”的“真实数据源”。
 * `ResEventType` 会从此类型自动派生。
 */
type ResEventDataMap = {
  // 对应客户端请求的响应
  sub: ISubData
  unsub: IUnsubData
} & {
  // 服务端主动推送的事件
  ping: IPingData
} & SubscribableEventDataMap // 包含所有可订阅的事件

// --- 派生类型定义 ---
// 所有 WebSocket 响应事件的名称集合，通过 `keyof` 从 `ResEventDataMap` 自动派生
export type ResEventType = keyof ResEventDataMap
// 所有客户端可以订阅的事件名称集合，通过 `keyof` 从 `SubscribableEventDataMap` 自动派生
export type SubscribedEventType = keyof SubscribableEventDataMap

// 事件监听器的函数类型
type Listener<T extends SubscribedEventType> = (data: ResEventDataMap[T]) => void

interface WSOptions {
  url?: string
  maxRetries?: number
  minReconnectionDelay?: number
  maxReconnectionDelay?: number
}

// 从 1 开始记数，因为默认返回0
let requestIdCount = 1
function genRequestId() {
  return requestIdCount++
}

function genAuthListenerkey(requestId: number) {
  return 'auth-' + requestId
}

class WebSocketService {
  private static instance: WebSocketService
  private ws: ReconnectingWebSocket | null = null
  private listeners: Map<SubscribedEventType, Set<Listener<SubscribedEventType>>> = new Map()
  private authListeners: Map<string, Listener<'auth'>> = new Map()
  private subscriptions: Set<SubscribedEventType> = new Set()
  private authPendingTopics: Set<SubscribedEventType> = new Set()
  private url: string = ''
  private options?: WSOptions
  private pendingQueue: WSRequestMessage<RequestEventType>[] = []

  private auth: {
    map: Record<number, string>
    signatureAuthed: string | undefined
  } = {
      map: {},
      signatureAuthed: undefined
    }

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

  // public auth(signture: string) {
  //   this.authSignature = signture
  //   if (this.ws && this.ws.readyState === WebSocket.OPEN) {
  //     this.send({ request: 'auth', args: signture })
  //   }
  // }

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
      const data = JSON.parse(raw) as ResMessage<ResEventType>
      // 处理 ping 事件
      if (data.type === 'ping') {
        this.replyPong(data as ResMessage<'ping'>)
        return
      }
      // 处理 auth 事件
      if (data.type === 'auth') {
        const requestId = data.requestId
        // 认证成功之后，执行回调
        if ((data.data as IAuthData).code === 9200) {
          // 存储认证成功的 signature
          this.auth.signatureAuthed = this.auth.map[requestId]

          // 如果认证监听函数存在的话, 调用认证监听器
          if (requestId && requestId !== 0) {
            const listenerKey = genAuthListenerkey(requestId)
            const authListener = this.authListeners.get(listenerKey)
            if (authListener) {
              authListener(data.data as IAuthData)
              this.authListeners.delete(listenerKey)
            }
          }
        }


        // 执行完之后，清除 map 中的 requestId
        delete this.auth.map[requestId]

        return
      }

      if (['sub', 'unsub', 'exit'].includes(data.type)) {
        // 暂时没有处理 sub 和 unsub 和 exit 事件
        return
      }
      this.dispatch(data as ResMessage<SubscribedEventType>)
    } catch (err) {
      console.warn(' WS parse error:', err, raw)
    }
  }

  /** 自动回复 pong */
  private replyPong(pingData: ResMessage<'ping'>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const pong: WSRequestMessage<'pong'> = { request: 'pong', args: { ts: Date.now() } }
      this.ws.send(JSON.stringify(pong))
    }
  }

  /** 分发事件 */
  private dispatch(data: ResMessage<SubscribedEventType>) {
    // 调用对应事件监听器
    const listeners = this.listeners.get(data.type)
    if (listeners) {
      listeners.forEach(cb => cb(data.data))
    }
    // order.97.* 订阅， 返回的数据格式为 order.97.[具体的 rwa 的 symbol]，特殊处理
    if (data.type.indexOf('order.') === 0) {
      const typeInfo = processType(data.type)
      const listenersOrder = this.listeners.get(typeInfo.replaced as SubscribedEventType)

      if (listenersOrder) {
        (data.data as IOrderData).sl = typeInfo.extracted
        listenersOrder.forEach(cb => cb(data.data))
      }
    }
  }

  /** 发送数据 */
  private send<T extends RequestEventType>(data: WSRequestMessage<T>) {
    // 对非 pong 请求，如果 没有 requestId， 则自动添加 requestId
    if (data.request !== 'pong' && data.requestId === undefined) {
      data.requestId = genRequestId()
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      this.pendingQueue.push(data)
    }
  }

  /** 重连后恢复订阅 */
  private resubscribeAll() {
    if (this.subscriptions.size === 0) return
    console.log('🔁 Resubscribing channels...', this.subscriptions)
    // 批量一次性订阅所有 topic
    this.send({ request: 'sub', args: [...this.subscriptions] })
  }

  public exitAuth() {
    // 如果没有认证成功的 signature， 则无需退出认证
    if (this.auth.signatureAuthed === undefined) {
      return
    }
    this.auth.signatureAuthed = undefined
    // 没有退出认证的请求，只能关闭再重新连接请求
    this.ws?.close()
    this.ws?.reconnect()
  }

  public onAuth(signature: string, listener: Listener<'auth'>) {
    this.ensureInitialized()
    // 每次发送 auth 请求时，都生成一个新的 requestId
    const requestId = genRequestId()

    this.auth.map[requestId] = signature

    // 存储 auth 监听器
    const listenerKey = genAuthListenerkey(requestId)
    this.authListeners.set(listenerKey, listener)

    this.send({ request: 'auth', args: signature, requestId: requestId })
  }

  public on<T extends SubscribedEventType>(eventType: T, listener: Listener<T>) {
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

  private subscribe(topic: SubscribedEventType | SubscribedEventType[]) {
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

  private unsubscribe(topic: SubscribedEventType | SubscribedEventType[]) {
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
  public off<T extends SubscribedEventType>(eventType: T, listener: Listener<T>) {
    if (!this.listeners.has(eventType)) return
    // 移除监听器
    const listenerSet = this.listeners.get(eventType)! as Set<Listener<T>>
    listenerSet.delete(listener)

    // 检查是否还有监听器
    const hasListeners = listenerSet.size > 0
    // 如果没有监听器了，自动取消订阅
    if (!hasListeners) {
      this.listeners.delete(eventType)
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

  // // 主动关闭连接后，立刻重新连接
  // public closeAndReConnect() {
  //   // clear auth signature
  //   this.authSignature = ''
  //   // 把私有订阅的 listener 也移除

  //   this.ws?.close()
  //   this.ws?.reconnect()
  // }
}

// 导出单例
const wsService = WebSocketService.getInstance()
export default wsService