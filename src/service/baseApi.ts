import client, { type ApiResponse } from "./client";
import type { 
  IChain, 
  IMarket, 
  IMarketState, 
  IStocks, 
  IToken
} from "./types";


export const baseApi = {
  getChains: () => client.get<ApiResponse<IChain[]>>('/v1/base/chains'),
  getTokens: (chainId?: number) => client.get<ApiResponse<IToken[]>>('/v1/base/tokens', { chainId }),
  getBaseRwas: (chainId?: number) => client.get<ApiResponse<IRwa[]>>('/v1/base/rwas', { chainId }),
  getStocks: () => client.get<ApiResponse<IStocks[]>>('/v1/base/stocks'),
  getMarket: () => client.get<ApiResponse<IMarket>>('/v1/base/market'),
  getMarketState: () => client.get<ApiResponse<IMarketState>>('/v1/base/market/state'),

  getRWAs: <T>(chainId: number) => client.get<T>(`/v1/base/quote/markets`),
};
