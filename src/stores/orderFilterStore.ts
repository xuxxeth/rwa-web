import { create } from 'zustand'
import { subDays } from 'date-fns'
import { setStartOfDay, setEndOfDay } from '@/components/date-range-picker'

function generateDefaultStartTime() {
  const thirtyDaysAgo = subDays(new Date(), 30)
  return Math.floor(setStartOfDay(thirtyDaysAgo).getTime() / 1000)
}

function generateDefaultEndTime() {
  const now = new Date()
  // 设置为当天的23:59:59
  return Math.floor(setEndOfDay(now).getTime() / 1000)
}

const defaultOpenOrderFilters: OrderFilterStore['openOrderFilters'] = {
  stockIds: ['all'],
  orderType: ['all'],
  side: ['all'],
  states: ['all'],
}

const defaultOrderHistoryFilters: OrderFilterStore['orderHistoryFilters'] = {
  stockIds: ['all'],
  orderType: ['all'],
  side: ['all'],
  states: ['all'],
  startTime: generateDefaultStartTime(),
  endTime: generateDefaultEndTime(),
}

const defaultTradeHistoryFilters: OrderFilterStore['tradeHistoryFilters'] = {
  stockIds: ['all'],
  orderType: ['all'],
  side: ['all'],
  states: ['all'],
  startTime: generateDefaultStartTime(),
  endTime: generateDefaultEndTime(),
}

export const useOrderFilterStore = create<OrderFilterStore>()(set => ({
  openOrderFilters: defaultOpenOrderFilters,
  orderHistoryFilters: defaultOrderHistoryFilters,
  tradeHistoryFilters: defaultTradeHistoryFilters,

  updateOpenOrderFilters: (filters: Partial<OrderFilterStore['openOrderFilters']>) =>
    set(state => ({
      openOrderFilters: { ...state.openOrderFilters, ...filters },
    })),
  updateOrderHistoryFilters: (filters: Partial<OrderFilterStore['orderHistoryFilters']>) =>
    set(state => ({
      orderHistoryFilters: { ...state.orderHistoryFilters, ...filters },
    })),
  updateTradeHistoryFilters: (filters: Partial<OrderFilterStore['tradeHistoryFilters']>) =>
    set(state => ({
      tradeHistoryFilters: { ...state.tradeHistoryFilters, ...filters },
    })),

  clearAllFilters: () =>
    set({
      openOrderFilters: defaultOpenOrderFilters,
      orderHistoryFilters: defaultOrderHistoryFilters,
      tradeHistoryFilters: defaultTradeHistoryFilters,
    }),
}))

export interface IOpenOrderFilter {
  stockIds?: string
  orderType?: string
  side?: string
  after?: string
  before?: string
  limit?: number
}

function handleSide(side: string[]) {
  if (side.includes('all') || side.length === 2) {
    return {}
  }
  if (side.length > 0) {
    return { side: side.join(',') }
  }
  return {}
}

function handleOrderType(orderType: string[]) {
  if (orderType.includes('all') || orderType.length === 2) {
    return {}
  }
  if (orderType.length > 0) {
    return { orderType: orderType.join(',') }
  }
  return {}
}

function handleStockIds(stockIds: string[]) {
  if (stockIds.includes('all')) {
    return {}
  }
  if (stockIds.length > 0) {
    return { stockIds: stockIds.join(',') }
  }
  return {}
}

export function generateOpenOrderFilterObj(filters: OrderFilterStore['openOrderFilters']) {
  const filterObj: IOpenOrderFilter = {}
  Object.assign(filterObj, handleSide(filters.side))

  Object.assign(filterObj, handleOrderType(filters.orderType))

  Object.assign(filterObj, handleStockIds(filters.stockIds))

  return filterObj
}

export interface IOrderHistoryFilter {
  stockIds?: string
  side?: string
  states?: string
  orderType?: string
  after?: string
  startTime?: number
  endTime?: number
}

export function generateOrderHistoryFilterObj(filters: OrderFilterStore['orderHistoryFilters']) {
  const filterObj: IOrderHistoryFilter = {}

  Object.assign(filterObj, handleSide(filters.side))

  Object.assign(filterObj, handleStockIds(filters.stockIds))

  Object.assign(filterObj, handleOrderType(filters.orderType))

  if (!filters.states.includes('all') && filters.states.length > 0) {
    filterObj.states = filters.states.join(',')
  }

  if (filters.startTime) {
    filterObj.startTime = filters.startTime
  }
  if (filters.endTime) {
    filterObj.endTime = filters.endTime
  }
  return filterObj
}

export interface ITradeHistoryFilter {
  stockIds?: string
  side?: string
  after?: string
  startTime?: number
  endTime?: number
  orderType?: string
}

export function generateTradeHistoryFilterObj(filters: OrderFilterStore['tradeHistoryFilters']) {
  const filterObj: ITradeHistoryFilter = {}

  Object.assign(filterObj, handleSide(filters.side))

  Object.assign(filterObj, handleStockIds(filters.stockIds))

  Object.assign(filterObj, handleOrderType(filters.orderType))

  if (filters.startTime) {
    filterObj.startTime = filters.startTime
  }
  if (filters.endTime) {
    filterObj.endTime = filters.endTime
  }
  return filterObj
}

interface OrderFilterStore {
  openOrderFilters: {
    stockIds: string[]
    orderType: string[]
    side: string[]
    states: string[]
  }
  orderHistoryFilters: {
    stockIds: string[]
    side: string[]
    orderType: string[]
    states: string[]
    startTime: number
    endTime: number
  }
  tradeHistoryFilters: {
    stockIds: string[]
    side: string[]
    states: string[]
    orderType: string[]
    startTime: number
    endTime: number
  }
  updateOpenOrderFilters: (filters: Partial<OrderFilterStore['openOrderFilters']>) => void
  updateOrderHistoryFilters: (filters: Partial<OrderFilterStore['orderHistoryFilters']>) => void
  updateTradeHistoryFilters: (filters: Partial<OrderFilterStore['tradeHistoryFilters']>) => void

  clearAllFilters: () => void
}
