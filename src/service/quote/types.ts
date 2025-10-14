import { type IRwa } from '../base/types'

export interface IQuote {
  price?: number
  up?: number
  dailyHigh?: number
}

export interface IMarketQuote extends IRwa {
  price?: string,
  up?: string,
  dailyHigh?: string,
}
