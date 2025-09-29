import type { ApiResponse } from "@/service/client";
import type { IChain, IMarket, IMarketState, IRwas, IStocks, IToken } from "@/service/types";


export interface BaseStore {
  count: number,
  chainList: IChain[],
  tokenList: IToken[],
  rwaList: IRwas[],
  stocksList: IStocks[],
  marketInfo: IMarket,
  marketState: IMarketState,
  getChains: () => Promise<ApiResponse<IChain[]>>,
  getTokens: (chainId?: number) => Promise<ApiResponse<IToken[]>>,
  getBaseRwas: (chainId?: number) => Promise<ApiResponse<IRwas[]>>,
  getStocks: () => Promise<ApiResponse<IStocks[]>>,
  getMarket: () => Promise<ApiResponse<IMarket>>,
  getMarketState: () => Promise<ApiResponse<IMarketState>>,
}