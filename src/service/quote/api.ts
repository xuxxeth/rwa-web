import client, { type ApiResponse } from "../client";
import type { IMarketQuote } from "./types";

export const quoteApi = {
  getMarketQuotes: (chainId?: number) => client.get<ApiResponse<IMarketQuote[]>>('/v1/base/public/quote/markets', { chainId }),
}