import client from "./client";
import type { 
  IChain, 
  IMarket, 
  IMarketState, 
  IRwas, 
  IStocks, 
  IToken
} from "./types";


export const baseApi = {
  getChains: () => client.get<IChain[]>('/v1/base/chains'),
  getTokens: (chainId?: number) => client.get<IToken[]>('/v1/base/tokens', { chainId }),
  getBaseRwas: (chainId?: number) => client.get<IRwas[]>('/v1/base/rwas', { chainId }),
  getStocks: () => client.get<IStocks[]>('/v1/base/stocks'),
  getMarket: () => client.get<IMarket>('/v1/base/market'),
  getMarketState: () => client.get<IMarketState>('/v1/base/market/state'),

  getRWAs: <T>(chainId: number) => client.get<T>(`/v1/quote/markets`),
};
