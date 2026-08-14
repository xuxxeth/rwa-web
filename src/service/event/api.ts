import client, { type ApiResponse } from "../client";
import type { IStockActionEvent, IStockActionEventData } from "./types";

export const eventApi = {
  getStockAction: (chainId: number, pageNum: number = 1, payinAddresses?: string, pageSize = 9) => 
                  client.get<ApiResponse<IStockActionEventData>>('/v1/base/public/stock-action/splits', { chainId, pageNum, payinAddresses, pageSize }),
  
};

