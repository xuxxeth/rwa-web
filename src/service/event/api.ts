import client, { type ApiResponse } from "../client";
import type { IStockActionEvent } from "./types";

export const eventApi = {
  getStockAction: (chainId: number, before?: number, after?: number, payinAddresses?: string, limit = 9) => 
                  client.get<ApiResponse<IStockActionEvent[]>>('/v1/base/public/stock-action', { chainId, before, after, payinAddresses, limit }),
  
};

