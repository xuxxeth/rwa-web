import client, { type ApiResponse } from "../client";
import type { 
  IChain, 
  IMarket, 
  IMarketState, 
  IStock, 
  IToken,
  IRwa,
  IStatistic,
  IProfile,
  IIndicators
} from "./types"


export const baseApi = {
  getChains: () => client.get<ApiResponse<IChain[]>>('/v1/base/public/chains'),
  getTokens: (chainId?: number) => client.get<ApiResponse<IToken[]>>('/v1/base/public/tokens', { chainId }),
  getBaseRwas: (chainId?: number) => client.get<ApiResponse<IRwa[]>>('/v1/base/public/rwas', { chainId }),
  getStocks: () => client.get<ApiResponse<IStock[]>>('/v1/base/public/stocks'),
  getMarket: () => client.get<ApiResponse<IMarket>>('/v1/base/public/market'),
  getMarketState: () => client.get<ApiResponse<IMarketState>>('/v1/base/public/market/state'),

  // 公司财务相关接口
  getStatistic: (stockId: number) => client.get<ApiResponse<IStatistic>>('/v1/base/public/stock/statistic', { stockId }),
  getProfile: (stockId: number) => client.get<ApiResponse<IProfile>>('/v1/base/public/stock/profile', { stockId }),
  getIndicators: (stockId: number) => client.get<ApiResponse<IIndicators[]>>('/v1/base/public/stock/indicators', { stockId }),
};
