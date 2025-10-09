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

export interface TradeStore {
  inputToken: IRwa | null,
  outputToken: IToken | null,
  limitPrice: string,
  inputSize: string,
  expires: number,
  updateInputToken: (rwa: IRwa) => void,
  updateOutputToken: (token: IToken) => void,
  updateLimitPrice: (price: string) => void,
  updateInputSize: (size: string) => void,
  updateExpires: (expires: number) => void
}