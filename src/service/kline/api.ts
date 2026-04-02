import client, { type ApiResponse } from "../client";
import type { ICandlesItem, ICandlesParams, IMinuteItem, IMinuteParams } from "./types";

export const klineApi = {
  getCandles: (params: ICandlesParams) => client.get<ApiResponse<ICandlesItem[]>>('/v1/quote/public/candles', { ...params }),
  getMinute: (params: IMinuteParams) => client.get<ApiResponse<IMinuteItem>>('/v1/quote/public/minute', { ...params })
};
