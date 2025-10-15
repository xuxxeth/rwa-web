import { type IRwa } from '../base/types'

export interface IQuote {
  price?: string
  up?: string
  dailyHigh?: string
}

export type IMarketQuote = IQuote & IRwa
  
