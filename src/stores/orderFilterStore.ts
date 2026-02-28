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
  side: ['all'],
  states: ['all'],
}

const defaultOrderHistoryFilters: OrderFilterStore['orderHistoryFilters'] = {
  stockIds: ['all'],
  side: ['all'],
  states: ['all'],
  orderType: ['all'],
  startTime: generateDefaultStartTime(),
  endTime: generateDefaultEndTime(),
}

const defaultTradeHistoryFilters: OrderFilterStore['tradeHistoryFilters'] = {
  stockIds: ['all'],
  side: ['all'],
  states: ['all'],
  orderType: ['all'],
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
  side?: string
  after?: string
  before?: string
  limit?: number
}

export function generateOpenOrderFilterObj(filters: OrderFilterStore['openOrderFilters']) {
  const filterObj: IOpenOrderFilter = {}
  if (!filters.side.includes('all') && filters.side.length > 0 && filters.side.length < 2) {
    filterObj.side = filters.side.join(',')
  }
  if (!filters.stockIds.includes('all') && filters.stockIds.length > 0) {
    filterObj.stockIds = filters.stockIds.join(',')
  }
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
  if (!filters.side.includes('all') && filters.side.length > 0 && filters.side.length < 2) {
    filterObj.side = filters.side.join(',')
  }
  if (!filters.states.includes('all') && filters.states.length > 0) {
    filterObj.states = filters.states.join(',')
  }
  if (!filters.stockIds.includes('all') && filters.stockIds.length > 0) {
    filterObj.stockIds = filters.stockIds.join(',')
  }
  if (
    !filters.orderType.includes('all') &&
    filters.orderType.length > 0 &&
    filters.orderType.length < 2
  ) {
    filterObj.orderType = filters.orderType.join(',')
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
  if (!filters.side.includes('all') && filters.side.length > 0 && filters.side.length < 2) {
    filterObj.side = filters.side.join(',')
  }
  if (
    !filters.orderType.includes('all') &&
    filters.orderType.length > 0 &&
    filters.orderType.length < 2
  ) {
    filterObj.orderType = filters.orderType.join(',')
  }
  if (!filters.stockIds.includes('all') && filters.stockIds.length > 0) {
    filterObj.stockIds = filters.stockIds.join(',')
  }
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
