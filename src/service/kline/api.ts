import client, { type ApiResponse } from "../client";
import type { ICandlesItem, ICandlesParams } from "./types";

export const klineApi = {
  getCandles: (params: ICandlesParams) => client.get<ApiResponse<ICandlesItem[]>>('/v1/quote/candles', { ...params }),

};
