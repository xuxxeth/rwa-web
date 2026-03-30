import { type IRwa } from '../base/types'

export interface IQuote {
  price?: number
  close?: number
  closeUp?: string
  up?: string
  dailyHigh?: number
  dailyLow?: number
  marketCap?: string
  floatCap?: string
}

export type IMarketQuote = IQuote & IRwa & { marketTradeState: number}
