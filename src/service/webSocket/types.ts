export interface IAggregateData {
    timestamp: number
    Items: {
      S: string
      p: number
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
  T: number // 时间戳(秒)
}[]

export type IPingData = number
