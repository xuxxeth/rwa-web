import client, { type ApiResponse } from "../client";
import type { IUserCofnig } from "./types";

export const riskApi = {
  getUserConfig: () => client.get<ApiResponse<IUserCofnig>>('/v1/risk/user/config', {}),

};