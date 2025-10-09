import client from "../client";

export const scanApi = {
  getOrders: () => client.get<any>('/v1/scan/orders'),

};
