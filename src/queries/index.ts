import {
  queryOptions,
  infiniteQueryOptions,
  type InfiniteData,
} from "@tanstack/react-query";
import { quoteApi } from "@/service/quote/api";
import { scanApi } from "@/service/scan/api";
import { type ITrade } from "@/service/scan/types";
import { type IOpenOrderFilter, type IOpenOrderHistoryFilter, type ITradeHistoryFilter} from "@/stores/orderFilterStore";

// 获取市场行情的 queryOptions
export function marketQuoteOptions(chainId: number) {
  return queryOptions({
    queryKey: ["marketQuotes", chainId],
    queryFn: async () => {
      const data = await quoteApi.getMarketQuotes(chainId);
      return data.data || [];
    },
    enabled: chainId !== null,
  });
}

export function openOrderOptions(chainId: number, isSignatureValid: boolean, filters?: IOpenOrderFilter) {
  return queryOptions({
    queryKey: ["openOrder", chainId, filters],
    queryFn: async () => {
      const data = await scanApi.getOpenOrders(filters);
      return data.data || [];
    },
    enabled: chainId !== null && isSignatureValid,
  });
}

export function orderHistoryOptions(chainId: number, isSignatureValid: boolean, filters?: IOpenOrderHistoryFilter) {
  return queryOptions({
    queryKey: ["orderHistory", chainId, filters],
    queryFn: async () => {
      const data = await scanApi.getOrderHistory(filters);
      return data.data || [];
    },
    enabled: chainId !== null && isSignatureValid,
  });
}

export function tradeHistoryOptions(chainId: number, isSignatureValid: boolean, filters?: ITradeHistoryFilter) {
  return queryOptions({
    queryKey: ["tradeHistory", chainId, filters],
    queryFn: async () => {
      const data = await scanApi.getTrades(filters);
      return data.data || [];
    },
    enabled: chainId !== null,
  });
}

export function infiniteTradeHistoryOptions(chainId: number, isSignatureValid: boolean) {
  return infiniteQueryOptions<
    {
      data: ITrade[];
      nextPage: number | undefined;
    },
    Error,
    InfiniteData<
      {
        data: ITrade[];
        nextPage: number | undefined;
      },
      number | undefined
    >,
    [string, number],
    number | undefined
  >({
    queryKey: ["infiniteTradeHistory", chainId],
    queryFn: async ({ pageParam }) => {
      // pageParam 是前一页的最后一个orderId，初始值为undefined
      const data = await scanApi.getTrades(chainId, pageParam, 10);
      const trades = data.data ?? [];

      return {
        data: trades,
        nextPage:
          trades.length > 0 ? trades[trades.length - 1].orderId : undefined,
      };
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled: chainId !== null && isSignatureValid,
  });
}
