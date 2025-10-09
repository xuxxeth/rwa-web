import type { ApiResponse } from "@/service/client";
import type { IChain, IMarket, IMarketState, IRwa, IStocks, IToken } from "@/service/base/types";


export interface BaseStore {
  count: number,
  lastChainId: number | null,
  lastInitTime: number,
  chainList: IChain[],
  tokenList: IToken[],
  rwaList: IRwa[],
  stocksList: IStocks[],
  marketInfo: IMarket,
  marketState: IMarketState,
  setTokens: (tokenList: IToken[]) => void,
  setRwas: (rwaList: IRwa[]) => void,
  getChains: () => Promise<ApiResponse<IChain[]>>,
  getTokens: (chainId?: number) => Promise<ApiResponse<IToken[]>>,
  getBaseRwas: (chainId?: number) => Promise<ApiResponse<IRwa[]>>,
  getStocks: () => Promise<ApiResponse<IStocks[]>>,
  getMarket: () => Promise<ApiResponse<IMarket>>,
  getMarketState: () => Promise<ApiResponse<IMarketState>>,
  autoInitialize: (chainId: number | null) => Promise<void>
}