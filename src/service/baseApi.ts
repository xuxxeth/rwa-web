import client from "./client";

export const baseApi = {
  getChains: () => client.get("/v1/base/chains"),
  getRWAs: (chainId: number) => client.get(`/v1/quote/markets`),
};
