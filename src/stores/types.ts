import type { ApiResponse } from "@/service/client";
import type { IChain, IMarket, IMarketState, IRwa, IRwaPrice, IStock, IToken, ITokenWithBalance, ITokenWithPrice} from "@/service/base/types";


export interface BaseStore {
  lastChainId: number | null,
  lastInitTime: number,
  chainList: IChain[],
  tokenList: IToken[],
  rwaList: IRwa[],
  stocksList: IStock[],
  marketInfo: IMarket,
  marketState: IMarketState,
  marketTradeState: number,
  tokenWithBalance: Record<string, ITokenWithBalance>,
  setTokenWithBalance: (tokenWithBalance: Record<string, ITokenWithBalance>) => void,
  tokenWithPrice: Record<string, ITokenWithPrice>,
  setTokenWithPrice: (tokenWithPrice: Record<string, ITokenWithPrice>) => void,
  init: (chainId: number | null) => Promise<void>,
  setTokens: (tokenList: IToken[]) => void,
  setRwas: (rwaList: IRwa[]) => void,
  getChains: () => Promise<ApiResponse<IChain[]>>,
  getTokens: (chainId?: number) => Promise<ApiResponse<IToken[]>>,
  getBaseRwas: (chainId?: number) => Promise<ApiResponse<IRwa[]>>,
  getStocks: () => Promise<ApiResponse<IStock[]>>,
  getMarket: () => Promise<ApiResponse<IMarket>>,
  getMarketState: () => Promise<ApiResponse<IMarketState>>,
  updateRwasPrice: (priceList: IRwaPrice[]) => void
  updateStocksPrice: (priceList: IRwaPrice[]) => void
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