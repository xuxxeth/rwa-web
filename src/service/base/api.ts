import client, { type ApiResponse } from "../client";
import type { 
  IChain, 
  IMarket, 
  IMarketState, 
  IStock, 
  IToken,
  IRwa,
  IStatistic,
  IProfile
} from "./types"


export const baseApi = {
  getChains: () => client.get<ApiResponse<IChain[]>>('/v1/base/chains'),
  getTokens: (chainId?: number) => client.get<ApiResponse<IToken[]>>('/v1/base/tokens', { chainId }),
  getBaseRwas: (chainId?: number) => client.get<ApiResponse<IRwa[]>>('/v1/base/rwas', { chainId }),
  getStocks: () => client.get<ApiResponse<IStock[]>>('/v1/base/stocks'),
  getMarket: () => client.get<ApiResponse<IMarket>>('/v1/base/market'),
  getMarketState: () => client.get<ApiResponse<IMarketState>>('/v1/base/market/state'),

  // 公司财务相关接口
  getStatistic: (stockId: number) => client.get<ApiResponse<IStatistic>>('/v1/base/stock/statistic', { stockId }),
  getProfile: (stockId: number) => client.get<ApiResponse<IProfile>>('/v1/base/stock/profile', { stockId }),
};
