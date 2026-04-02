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
import type { ICandlesItem, ICandlesParams } from "@/service/kline/types";
import type { IUserCofnig } from "@/service/risk/types";
import type { IOrderData, ISummaryData, ISummaryDataItem } from "@/service/webSocket/types";
import { type IKycDetail, type IKycStatus } from '@/service/kyc/types'
import type { SessionType, TradeType } from "@/hooks/useCaCommon"

export interface BaseStore {
  connectInit: boolean,
  showConnect: boolean,
  currentWallet: any,
  currentChain: IChain | null;
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
  setConnectInit: (init: boolean) => void;
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
  refreshByLanguage: () => Promise<void>
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
  setCurrentChain: (chain: IChain | null) => void;
}

export interface TradeStore {
  realtimeRwaData: ISummaryDataItem | null;
  inputToken: IRwa | null;
  outputToken: IToken | null;
  limitPrice: string;
  inputSize: string;
  expires: number;
  activeConvertTab: 'buy' | 'sell';
  tradeType: TradeType;
  sessionType: SessionType;
  slippage: number;
  isSignatureValid: boolean;
  txStep: number;
  txError: string;
  txSuccess: {type: string, msg: string, tx: string};
  updateInputToken: (rwa: IRwa) => void;
  updateOutputToken: (token: IToken) => void;
  updateLimitPrice: (price: string) => void;
  updateInputSize: (size: string) => void;
  updateExpires: (expires: number) => void;
  updateActiveConvertTab: (tab: 'buy' | 'sell') => void;
  updateTradeType: (tradeType: TradeType) => void;
  updateSessionType: (sessionType: SessionType) => void;
  updateSlippage: (slippage: number) => void;
  setIsSignatureValid: (valid: boolean) => void
  setTxStep: (step: number) => void
  setTxError: (msg: string) => void
  setTxSuccess: (type: string, msg: string, tx: string) => void
  setRealtimeRwaData: (data: ISummaryDataItem | null) => void
}

export interface WssStore {
  priceInitialized: Boolean,
  stableTokenWithPrice: Record<string, ITokenWithPrice>;
  tokenWithPrice: Record<string, ITokenWithPrice>;
  newOrder: IOrderData | null;
  originSummary: ISummaryDataItem[];
  setStableTokenWithPrice: (data: IRwaPrice[]) => void;
  getCandles: (params: ICandlesParams) => Promise<ApiResponse<ICandlesItem[]>>;
  updateNewOrder: (order: IOrderData) => void;
  updateOriginSummary: (data: ISummaryDataItem[]) => void;
}

export interface RiskSTore {
  riskUserConfig: IUserCofnig | null
  getUserConfig: () => Promise<ApiResponse<IUserCofnig>>;
}

export interface KycState {
  kycStatus: IKycStatus | null
  kycDetail: IKycDetail | null
  isLoading: boolean
  error: string | null
  retryCount: number
}

export interface KycActions {
  fetchKycStatus: () => Promise<void>
  refetchKycStatusAndConfigIfNeed: (kycDetail: IKycDetail) => Promise<void>
  updateRetryCount: (count: number) => void
}

export type KycStore = RiskSTore & KycState & KycActions
