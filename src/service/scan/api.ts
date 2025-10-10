import client, { type ApiResponse } from "../client";
import type { IOrder, ITrade, IOpenOrder } from "./types";
import type {
  IOpenOrderFilter,
  IOpenOrderHistoryFilter,
  ITradeHistoryFilter,
} from "@/stores/orderFilterStore";

export const scanApi = {
  getOpenOrders: async (filters?: IOpenOrderFilter) => {
    return await client.get<ApiResponse<IOpenOrder[]>>("/v1/scan/orders", {
      ...filters,
    });
  },

  getOrderHistory: (filters?: IOpenOrderHistoryFilter) =>
    client.get<ApiResponse<IOrder[]>>("/v1/scan/history-orders", {
      ...filters,
    }),

  getTrades: (filters?: ITradeHistoryFilter) =>
    client.get<ApiResponse<ITrade[]>>("/v1/scan/trades", {
      ...filters,
    }),
};
