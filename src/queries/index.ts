import { queryOptions } from "@tanstack/react-query";
import { baseApi } from "@/service/baseApi";

import { type MarketQuoteResponse } from "@/views/markets/MarketQuotes/types";

// 获取市场行情的 queryOptions
export function marketQuoteOptions(chainId: number) {
  return queryOptions({
    queryKey: ["marketQuotes", chainId],
    queryFn: async () => {
      const data = await baseApi.getRWAs<MarketQuoteResponse>(chainId);
      return data.data || []
    },
    enabled: chainId !== null,
  });
}
