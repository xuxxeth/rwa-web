import ReconnectingWebSocket from "reconnecting-websocket";

export const WSS_URL = import.meta.env.VITE_WSS_URL

export interface WSMessage {
  request: string;
  args: any;
}
export interface ResMessage {
  type: string;
  data: string;
}

type Listener = (data: ResMessage) => void;

interface WSOptions {
  url?: string;
  maxRetries?: number;
  minReconnectionDelay?: number;
  maxReconnectionDelay?: number;
}

class WebSocketService {
  private static instance: WebSocketService;
  private ws: ReconnectingWebSocket | null = null;
  private listeners: Map<string, Set<Listener>> = new Map();
  private subscriptions: Set<string> = new Set();
  private url: string = "";
  private options?: WSOptions;
  private pendingQueue: WSMessage[] = [];

  /** 单例获取 */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /** 初始化, 只允许初始化一次*/
  public init(options: WSOptions) {
    if (this.ws) {
      console.warn("WebSocket 已初始化");
      return;
    }

    this.url = options.url || WSS_URL;
    this.options = options;

    this.ws = new ReconnectingWebSocket(this.url, [], {
      maxRetries: options.maxRetries ?? 10,
      minReconnectionDelay: options.minReconnectionDelay ?? 3000,
      maxReconnectionDelay: options.maxReconnectionDelay ?? 10000,
      reconnectionDelayGrowFactor: 1.3,
    });

    this.bindEvents();
  }

  /** 绑定事件 */
  private bindEvents() {
    if (!this.ws) return;

    this.ws.addEventListener("open", () => {
      console.log("WebSocket connected:", this.url);
      // 发送缓存消息
      this.pendingQueue.forEach((msg) => this.send(msg));
      this.pendingQueue = [];
      this.resubscribeAll();
    });

    this.ws.addEventListener("message", this.handleMessageBound);

    this.ws.addEventListener("close", () => {
      console.log("🔌 WebSocket disconnected");
    });

    this.ws.addEventListener("error", (err) => {
      console.error("WebSocket error:", err);
    });
  }
  private handleMessageBound = (event: MessageEvent) => this.handleMessage(event.data);
  /** 处理消息 */
  private handleMessage(raw: any) {
    try {
      const data: ResMessage = JSON.parse(raw);
      if (data.type === "ping") {
        this.replyPong(data);
        return;
      }

      this.dispatch(data);
    } catch (err) {
      console.warn(" WS parse error:", err, raw);
    }
  }

  /** 自动回复 pong */
  private replyPong(pingData: ResMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const pong = { request: "pong", args: {ts: Date.now() } };
      this.ws.send(JSON.stringify(pong));
      console.log("Pong replied:", pong);
    }
  }

  /** 分发事件 */
  private dispatch(data: ResMessage) {
    // 调用对应事件监听器
    const listeners = this.listeners.get(data.type);
    if (listeners) {
      listeners.forEach((cb) => cb(data));
    }
  }

  /** 发送数据 */
  private send(data: WSMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not open, message queued:", data);
      this.pendingQueue.push(data);
    }
  }


  /** 重连后恢复订阅 */
  private resubscribeAll() {
    if (this.subscriptions.size === 0) return;
    console.log("🔁 Resubscribing channels...");
    this.subscriptions.forEach((sub) => this.send({ request: 'sub', args: [sub] }));
  }

  /** 注册事件监听 */
  private on(eventType: string, listener: Listener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  /** 移除事件监听 */
  private off(eventType: string, listener: Listener) {
    this.listeners.get(eventType)?.delete(listener);
  }

  /** 订阅（记录以便重连恢复） */
  public subscribe(args: string | string[], listener: Listener) {
    if (!this.ws) {
      console.warn("WebSocket 未初始化，自动初始化中...");
      this.init({ url: this.url || WSS_URL });
    }
    const topicList = Array.isArray(args) ? args : [args];
    topicList.forEach((topic) => this.on(topic, listener));
    const newTopics = topicList.filter((t) => !this.subscriptions.has(t));

    if (newTopics.length === 0) {
      console.log("所有 topic 已订阅，无需重复:", topicList);
      return;
    }
    newTopics.forEach((topic) => this.subscriptions.add(topic));
    this.send({request: 'sub', args: newTopics });

  }

  /** 取消订阅 */
  public unsubscribe(args: string | string[], listener: Listener) {

    const topicList = Array.isArray(args) ? args : [args];
    topicList.forEach((t) => this.off(t, listener))

    const validTopics = topicList.filter((t) => this.subscriptions.has(t));
    if (validTopics.length === 0) return;
    
    // 如果 监听事件数大于0，则不进行取消订阅操作，只进行移除相关事件操作
    validTopics.forEach(t => {
      if (!this.listeners.get(t)?.size) {
        this.subscriptions.delete(t)
        this.send({ request: "unsub", args: [t] });
      }
    })
    // validTopics.forEach((t) => this.subscriptions.delete(t));
    
  }

  /** 移除所有事件监听 */
  public removeAllListeners() {
    this.listeners.clear();
  }
  /** 移除所有订阅（并通知服务端） */
  public clearSubscriptions() {
    const topics = Array.from(this.subscriptions);
    if (topics.length > 0) {
      this.send({
        request: "unsub",
        args: topics,
      });
    }
    this.subscriptions.clear();
  }

  /** 主动关闭连接 */
  public close() {
    this.removeAllListeners();
    this.clearSubscriptions();
    this.ws?.removeEventListener("message", this.handleMessageBound);
    this.ws?.close();
    this.ws = null;
    console.log("🧹 WebSocket closed manually");
  }
}

// 导出单例
const wsService = WebSocketService.getInstance();
export default wsService;
