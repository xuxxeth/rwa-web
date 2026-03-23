import { type IRwa } from '../base/types'

export interface IQuote {
  price?: string
  close?: string
  closeUp?: string
  up?: string
  dailyHigh?: string
  dailyLow?: string
  marketCap?: string
  floatCap?: string
}

export type IMarketQuote = IQuote & IRwa
