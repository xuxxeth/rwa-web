import client, { type ApiResponse } from '../client'
import type { IOrder, ITrade, IOpenOrder, IRebate, IClaim, IRebateFilter } from './types'
import type {
  IOpenOrderFilter,
  IOrderHistoryFilter,
  ITradeHistoryFilter,
} from '@/stores/orderFilterStore'
import { type ErrorHandlers } from '@/config/constants'

export const scanApi = {
  getOpenOrders: async (filters?: IOpenOrderFilter, errorHandlers?: ErrorHandlers) => {
    return await client.get<ApiResponse<IOpenOrder[]>>(
      '/v1/scan/api/orders',
      {
        ...filters,
      },
      { errorHandlers }
    )
  },

  getOrderHistory: (filters?: IOrderHistoryFilter, errorHandlers?: ErrorHandlers) =>
    client.get<ApiResponse<IOrder[]>>(
      '/v1/scan/api/history-orders',
      {
        ...filters,
      },
      { errorHandlers }
    ),

  getTrades: (filters?: ITradeHistoryFilter, errorHandlers?: ErrorHandlers) =>
    client.get<ApiResponse<ITrade[]>>(
      '/v1/scan/api/trades',
      {
        ...filters,
      },
      { errorHandlers }
    ),
  getRebates: (filters?: IRebateFilter, errorHandlers?: ErrorHandlers) => {
    return client.get<ApiResponse<IRebate[]>>(
      '/v1/scan/api/ref/rebates',
      { ...filters },
      { errorHandlers }
    )
  },
  getClaims: (filters?: IRebateFilter, errorHandlers?: ErrorHandlers) => {
    return client.get<ApiResponse<IClaim[]>>(
      '/v1/scan/api/ref/claims',
      { ...filters },
      { errorHandlers }
    )
  },
}
