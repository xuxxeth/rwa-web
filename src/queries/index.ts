import { queryOptions, infiniteQueryOptions, type InfiniteData } from '@tanstack/react-query'
import { quoteApi } from '@/service/quote/api'
import { scanApi } from '@/service/scan/api'
import { type ITrade, type IOpenOrder, type IOrder } from '@/service/scan/types'
import {
  type IOpenOrderFilter,
  type IOrderHistoryFilter,
  type ITradeHistoryFilter,
} from '@/stores/orderFilterStore'
import { type ErrorHandlers } from '@/config/constants'

// 获取市场行情的 queryOptions
export function marketQuoteOptions(chainId: number) {
  return queryOptions({
    queryKey: ['marketQuotes', chainId],
    queryFn: async () => {
      const data = await quoteApi.getMarketQuotes(chainId)
      return data?.data || []
    },
    enabled: chainId !== null,
  })
}

export function openOrderOptions(
  account: string,
  chainId: number,
  isSignatureValid: boolean,
  filters?: IOpenOrderFilter
) {
  return queryOptions({
    queryKey: ['openOrder', account, chainId, filters],
    queryFn: async () => {
      const data = await scanApi.getOpenOrders(filters)
      return data?.data || []
    },
    enabled: chainId !== null && isSignatureValid,
  })
}

export function infiniteOrderOptions<T extends { orderId: string }, F extends { after?: string }>(
  api: (filters: F, errorHandlers?: ErrorHandlers) => Promise<{ data: T[] }>,
  account: string,
  chainId: number,
  isSignatureValid: boolean,
  scrollId: (item: T) => string,
  filters?: F,
  errorHandlers?: ErrorHandlers
) {
  return infiniteQueryOptions<
    {
      data: T[]
      nextPage: string | undefined
    },
    Error,
    InfiniteData<
      {
        data: T[]
        nextPage: string | undefined
      },
      string | undefined
    >,
    [string, string, number, F | undefined],
    string | undefined
  >({
    queryKey: [api.name, account, chainId, filters],
    queryFn: async ({ pageParam }) => {
      // pageParam 是前一页的最后一个orderId，初始值为undefined
      const data = await api(
        {
          ...filters,
          after: pageParam,
        } as F,
        errorHandlers
      )
      const orders = data?.data ?? []
      const hasNextPage = orders.length > 0
      const nextPageParams = hasNextPage ? scrollId(orders[orders.length - 1]) : undefined
      return {
        data: orders,
        nextPage: nextPageParams,
      }
    },
    initialPageParam: undefined,
    getNextPageParam: lastPage => lastPage?.nextPage,
    enabled: chainId !== null && isSignatureValid,
  })
}

export function infiniteOpenOrderOptions(
  account: string,
  chainId: number,
  isSignatureValid: boolean,
  filters?: IOpenOrderFilter,
  errorHandlers?: ErrorHandlers
) {
  return infiniteQueryOptions<
    {
      data: IOpenOrder[]
      nextPage: string | undefined
    },
    Error,
    InfiniteData<
      {
        data: IOpenOrder[]
        nextPage: string | undefined
      },
      string | undefined
    >,
    [string, string, number, IOpenOrderFilter | undefined],
    string | undefined
  >({
    queryKey: ['infiniteOpenOrder', account, chainId, filters],
    queryFn: async ({ pageParam }) => {
      // pageParam 是前一页的最后一个orderId，初始值为undefined
      const data = await scanApi.getOpenOrders(
        {
          ...filters,
          after: pageParam,
        },
        errorHandlers
      )
      const orders = data?.data ?? []
      const hasNextPage = orders.length > 0
      const nextPageParams = hasNextPage ? orders[orders.length - 1].orderId : undefined
      return {
        data: orders,
        nextPage: nextPageParams,
      }
    },
    initialPageParam: undefined,
    getNextPageParam: lastPage => lastPage?.nextPage,
    enabled: chainId !== null && isSignatureValid,
  })
}

export function orderHistoryOptions(
  account: string,
  chainId: number,
  isSignatureValid: boolean,
  filters?: IOrderHistoryFilter
) {
  return queryOptions({
    queryKey: ['orderHistory', account, chainId, filters],
    queryFn: async () => {
      const data = await scanApi.getOrderHistory(filters)
      return data?.data || []
    },
    enabled: chainId !== null && isSignatureValid,
  })
}

export function infiniteOrderHistoryOptions(
  account: string,
  chainId: number,
  isSignatureValid: boolean,
  filters?: IOrderHistoryFilter,
  errorHandlers?: ErrorHandlers
) {
  return infiniteQueryOptions<
    {
      data: IOrder[]
      nextPage: string | undefined
    },
    Error,
    InfiniteData<
      {
        data: IOrder[]
        nextPage: string | undefined
      },
      string | undefined
    >,
    [string, string, number, IOrderHistoryFilter | undefined],
    string | undefined
  >({
    queryKey: ['infiniteOrderHistory', account, chainId, filters],
    queryFn: async ({ pageParam }) => {
      // pageParam 是前一页的最后一个orderId，初始值为undefined
      const data = await scanApi.getOrderHistory(
        {
          ...filters,
          after: pageParam,
        },
        errorHandlers
      )
      const orders = data?.data ?? []
      const hasNextPage = orders.length > 0
      const nextPageParams = hasNextPage ? orders[orders.length - 1].orderId : undefined

      return {
        data: orders,
        nextPage: nextPageParams,
      }
    },
    initialPageParam: undefined,
    getNextPageParam: lastPage => lastPage?.nextPage,
    enabled: chainId !== null && isSignatureValid,
  })
}

export function tradeHistoryOptions(
  chainId: number,
  isSignatureValid: boolean,
  filters?: ITradeHistoryFilter
) {
  return queryOptions({
    queryKey: ['tradeHistory', chainId, filters],
    queryFn: async () => {
      const data = await scanApi.getTrades(filters)
      return data?.data || []
    },
    enabled: chainId !== null,
  })
}

export function infiniteTradeHistoryOptions(
  account: string,
  chainId: number,
  isSignatureValid: boolean,
  filters?: ITradeHistoryFilter,
  errorHandlers?: ErrorHandlers
) {
  return infiniteQueryOptions<
    {
      data: ITrade[]
      nextPage: string | undefined
    },
    Error,
    InfiniteData<
      {
        data: ITrade[]
        nextPage: string | undefined
      },
      number | undefined
    >,
    [string, string, number, ITradeHistoryFilter | undefined],
    string | undefined
  >({
    queryKey: ['infiniteTradeHistory', account, chainId, filters],
    queryFn: async ({ pageParam }) => {
      // pageParam 是前一页的最后一个orderId，初始值为undefined
      const data = await scanApi.getTrades({ ...filters, after: pageParam }, errorHandlers)
      const trades = data?.data ?? []
      const hasNextPage = trades.length > 0
      const nextPageParams = hasNextPage ? trades[trades.length - 1].id : undefined

      return {
        data: trades,
        nextPage: nextPageParams,
      }
    },
    initialPageParam: undefined,
    getNextPageParam: lastPage => lastPage?.nextPage,
    enabled: chainId !== null && isSignatureValid,
  })
}
