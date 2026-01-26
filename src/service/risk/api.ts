import client, { type ApiResponse } from "../client";
import type { IStartVerification, IUserCofnig } from "./types";

export const riskApi = {
  getUserConfig: () => client.get<ApiResponse<IUserCofnig>>('/v1/risk/api/user/config', {}),
  startVerification: () => client.get<ApiResponse<IStartVerification>>('/v1/kyc/api/startVerification', {}),
};