import { create } from 'zustand'
import { subDays } from 'date-fns'

function generateDefaultStartTime() {
  return Math.ceil(subDays(new Date(), 30).getTime() / 1000)
}

function generateDefaultEndTime() {
  return Math.ceil(Date.now() / 1000)
}

export const useOrderFilterStore = create<OrderFilterStore>()(set => ({
  openOrderFilters: {
    side: ['all'],
    states: ['all'],
  },
  orderHistoryFilters: {
    side: ['all'],
    states: ['all'],
    orderType: ['all'],
    startTime: generateDefaultStartTime(),
    endTime: generateDefaultEndTime(),
  },
  tradeHistoryFilters: {
    side: ['all'],
    states: ['all'],
    orderType: ['all'],
    startTime: generateDefaultStartTime(),
    endTime: generateDefaultEndTime(),
  },

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
}))

export interface IOpenOrderFilter {
  side?: string
  after?: string
}

export function generateOpenOrderFilterObj(filters: OrderFilterStore['openOrderFilters']) {
  const filterObj: IOpenOrderFilter = {}
  if (!filters.side.includes('all') && filters.side.length > 0 && filters.side.length < 2) {
    filterObj.side = filters.side.join(',')
  }
  return filterObj
}

export interface IOpenOrderHistoryFilter {
  side?: string
  states?: string
  orderType?: string
  after?: string
  startTime?: number
  endTime?: number
}

export function generateOrderHistoryFilterObj(filters: OrderFilterStore['orderHistoryFilters']) {
  const filterObj: IOpenOrderHistoryFilter = {}
  if (!filters.side.includes('all') && filters.side.length > 0 && filters.side.length < 2) {
    filterObj.side = filters.side.join(',')
  }
  if (!filters.states.includes('all') && filters.states.length > 0) {
    filterObj.states = filters.states.join(',')
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
    side: string[]
    states: string[]
  }
  orderHistoryFilters: {
    side: string[]
    orderType: string[]
    states: string[]
    startTime: number
    endTime: number
  }
  tradeHistoryFilters: {
    side: string[]
    states: string[]
    orderType: string[]
    startTime: number
    endTime: number
  }
  updateOpenOrderFilters: (filters: Partial<OrderFilterStore['openOrderFilters']>) => void
  updateOrderHistoryFilters: (filters: Partial<OrderFilterStore['orderHistoryFilters']>) => void
  updateTradeHistoryFilters: (filters: Partial<OrderFilterStore['tradeHistoryFilters']>) => void
}
