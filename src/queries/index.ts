import { queryOptions } from "@tanstack/react-query";
import { quoteApi } from "@/service/quote/api";

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
