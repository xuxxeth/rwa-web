import client, { type ApiResponse } from "../client";
import type { IStockActionEvent } from "./types";

export const eventApi = {
  getStockAction: (chainId: number, after?: number, payinAddresses?: string) => 
                  client.get<ApiResponse<IStockActionEvent[]>>('/v1/base/public/stock-action', { chainId, after, payinAddresses }),
  
};

