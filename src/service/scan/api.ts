import client, { type ApiResponse } from "../client";
import type { IOrder, ITrade, IOpenOrder } from "./types";

export const scanApi = {
  getOpenOrders: async (filters?: { side?: string }) => {
    return await client.get<ApiResponse<IOpenOrder[]>>("/v1/scan/orders", {
      ...filters,
    });
  },

  getOrderHistory: (chainId: number) =>
    client.get<ApiResponse<IOrder[]>>("/v1/scan/history-orders"),

  getTrades: (chainId: number, lastOrderId?: number, pageSize: number = 10) =>
    client.get<ApiResponse<ITrade[]>>("/v1/scan/trades", {
      after: lastOrderId,
      limit: pageSize,
    }),
};
