import {
  queryOptions,
  infiniteQueryOptions,
  type InfiniteData,
} from "@tanstack/react-query";
import { quoteApi } from "@/service/quote/api";
import { scanApi } from "@/service/scan/api";
import { type ITrade } from "@/service/scan/types";

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

export function openOrderOptions(chainId: number, filters?: { side?: string }) {
  return queryOptions({
    queryKey: ["openOrder", chainId, filters],
    queryFn: async () => {
      const data = await scanApi.getOpenOrders(filters);
      return data.data || [];
    },
    enabled: chainId !== null,
  });
}

export function orderHistoryOptions(chainId: number) {
  return queryOptions({
    queryKey: ["orderHistory", chainId],
    queryFn: async () => {
      const data = await scanApi.getOrderHistory(chainId);
      return data.data || [];
    },
    enabled: chainId !== null,
  });
}

export function tradeHistoryOptions(chainId: number) {
  return queryOptions({
    queryKey: ["tradeHistory", chainId],
    queryFn: async () => {
      const data = await scanApi.getTrades(chainId);
      return data.data || [];
    },
    enabled: chainId !== null,
  });
}

export function infiniteTradeHistoryOptions(chainId: number) {
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
    enabled: chainId !== null,
  });
}
