import { type IRwa } from '../base/types'

export interface IQuote {
  price?: number
  up?: string
  dailyHigh?: number
  dailyLow?: number
  marketCap?: string
  floatCap?: string
}

export type IMarketQuote = IQuote & IRwa
