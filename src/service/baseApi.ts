import client from "./client";

export const baseApi = {
  getChains: () => client.get("/v1/base/chains"),
  getRWAs: <T>(chainId: number) => client.get<T>(`/v1/quote/markets`),
};
