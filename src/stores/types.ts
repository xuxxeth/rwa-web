import type { ApiResponse } from "@/service/client";
import type {
  IChain,
  IMarket,
  IMarketState,
  IRwa,
  IRwaPrice,
  IStock,
  IToken,
  ITokenWithBalance,
  ITokenWithPrice,
  IStockWithPrice
} from "@/service/base/types";

export interface BaseStore {
  showConnect: boolean,
  currentWallet: any,
  lastChainId: number | null;
  lastInitTime: number;
  chainList: IChain[];
  tokenList: IToken[];
  rwaList: IRwa[];
  stocksList: IStock[];
  marketInfo: IMarket;
  marketState: IMarketState;
  marketTradeState: number;
  tokenWithBalance: Record<string, ITokenWithBalance>;
  freshTokenBalancesCount: number;
  stockWithPrice: Record<string, IStockWithPrice>;
  setShowConnect: (show: boolean) => void;
  setCurrentWallet: (wallet: any) => void;
  setStockWithPrice: (
    stockWithPrice: Record<string, IStockWithPrice>
  ) => void;
  setStockWithPriceByWebSocketData: (data: IRwaPrice[]) => void;
  setTokenWithBalance: (
    tokenWithBalance: Record<string, ITokenWithBalance>
  ) => void;
  tokenWithPrice: Record<string, ITokenWithPrice>;
  setTokenWithPrice: (tokenWithPrice: Record<string, ITokenWithPrice>) => void;
  setTokenWithPriceByWebSocketData: (data: IRwaPrice[]) => void;
  init: (chainId: number | null) => Promise<void>;
  setTokens: (tokenList: IToken[]) => void;
  setRwas: (rwaList: IRwa[]) => void;
  getChains: () => Promise<ApiResponse<IChain[]>>;
  getTokens: (chainId?: number) => Promise<ApiResponse<IToken[]>>;
  getBaseRwas: (chainId?: number) => Promise<ApiResponse<IRwa[]>>;
  getStocks: () => Promise<ApiResponse<IStock[]>>;
  getMarket: () => Promise<ApiResponse<IMarket>>;
  getMarketState: () => Promise<ApiResponse<IMarketState>>;
  updateRwasPrice: (priceList: IRwaPrice[]) => void;
  updateStocksPrice: (priceList: IRwaPrice[]) => void;
  freshTokenBalances: () => void;
}

export interface TradeStore {
  inputToken: IRwa | null;
  outputToken: IToken | null;
  limitPrice: string;
  inputSize: string;
  expires: number;
  updateInputToken: (rwa: IRwa) => void;
  updateOutputToken: (token: IToken) => void;
  updateLimitPrice: (price: string) => void;
  updateInputSize: (size: string) => void;
  updateExpires: (expires: number) => void;
}

export interface WssStore {
  priceInitialized: Boolean,
  stableTokenWithPrice: Record<string, ITokenWithPrice>;
  tokenWithPrice: Record<string, ITokenWithPrice>;
  setStableTokenWithPrice: (data: IRwaPrice[]) => void;
}
