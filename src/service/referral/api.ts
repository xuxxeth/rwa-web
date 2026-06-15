import client, { type ApiResponse } from '../client'
import { type IInviteCodeInfo, type IRelationshipInfo, type IInvitee } from './types'
import { type IRebateFilter } from '../scan/types'

export const referralApi = {
  getInviteCodeInfo: () => client.get<ApiResponse<IInviteCodeInfo>>('/v1/ref/api/code/get'),
  getInvitees: (filters?: IRebateFilter) =>
    client.get<ApiResponse<IInvitee[]>>('/v1/ref/api/relationship/list', { ...filters }),
  getRelationship: () => client.get<ApiResponse<IRelationshipInfo>>('/v1/ref/api/relationship/get'),
  bindRelationship: (inviteCode: string) =>
    client.post<ApiResponse<null>>(
      '/v1/ref/api/relationship/bind?code=' + encodeURIComponent(inviteCode),
      {}
    ),
}
