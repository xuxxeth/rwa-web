export interface IAggregateData {
    timestamp: number
    items: {
      S: string
      p: number
      c: number
      pc: number
      s: number
    }[]
  }

export type ISummaryData = {
  s: number // 股票编号
  S: string // 股票Symbol
  p: number // 最新价
  o: number // 今开价
  l: number // 最低价
  h: number // 最高价
  c: number // 当日收盘价
  pc: number // 昨日收盘价
  wc: number // 上周收盘价
  T: number // 时间戳(秒)
}[]

export type ISummaryDataItem = {
  s: number // 股票编号
  S: string // 股票Symbol
  p: number // 最新价
  pt?: number // 最新价格时间
  o: number // 今开价
  l: number // 最低价
  h: number // 最高价
  c: number // 当日收盘价
  pc: number // 昨日收盘价
  ct: number, // 收盘时间(秒)
  T: number // 时间戳(秒)
}

export type IPingData = number

export type Code = 9200 | 9901 | 9401 | 9403 | 9429 | 9500

export type IAuthData = {
  code: Code,
  data?: string
  message?: string
}

export type ISubData =  {
  code: Code
  data?: any
  message?: string
}

export type IUnsubData = {
  code: Code
  data?: any
  message?: string
}

export type IOrderData = {
    "hx": string   // tx_hash
    "id": number,     // Order id
    "si": number,            // Stock id
    "p": number,      // Order price
    "s": number,          // Order size
    "S": string,         // Order side: BUY/SELL
    "y": string,       // Trade type: MARKET/LIMIT
    "x": string,         // Order status
    "R": string,        // Risk type
    "N": number,      // Network fee(Stable Token)
    "V": number,          // Network fee(Native Token)
    "f": string,         // Time in force
    "d": 7,             // Valid date
    "st": string,    // SessionType
    "T": string,        // Token of payment
    "m": number         // 委托金额
    "t": number     // Update time(Unix timestamp: s)
    "E": number  // Event time(Unix timestamp: ms)
    "sl": string  // 提取的具体的 rwa symbol
    "c": number // Cumulative trade amount
    "r"?: number
  }
