import client, { type ApiResponse } from '../client'
import { type IFavorites } from './types'

export const ucApi = {
  getFavorites: () => client.get<ApiResponse<IFavorites>>(`/v1/uc/api/favorites`),
  addFavorite: (stockId: number) =>
    client.post(`/v1/uc/api/favorites`, stockId, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  removeFavorite: (stockId: number) =>
    client.delete(`/v1/uc/api/favorites`, stockId, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
}
