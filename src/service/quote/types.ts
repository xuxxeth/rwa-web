import { type IRwa } from '../base/types'

export interface IQuote {
  price?: string
  up?: string
  dailyHigh?: string
  weekUp?: string
  dailyLow?: string
  marketCap?: string
  floatCap?: string
}

export type IMarketQuote = IQuote &
  IRwa & {
    isFavorite: boolean
  }
