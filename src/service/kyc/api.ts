import client, { type ApiResponse } from '../client'
import type {
  ISupportedCountry,
  IKycStatus,
  IKycDetail,
  IKycSubmitData,
  FilePutMimeType,
  IFilePutUrlRes,
  IFillAccessUrlRes,
  ILivenessUrlRes,
  IPrivacyRes,
} from './types'

export const kycApi = {
  getLivenessUrl: () =>
    client.get<ApiResponse<ILivenessUrlRes>>('/v1/kyc/liveness/create-liveness-url'),
  validateLivenessImage: (s3Key: string) =>
    client.get<ApiResponse<boolean>>('/v1/kyc/liveness/validate-image', { key: s3Key }),
  isLivenessUrlExpired: (bizNo: string) =>
    client.get<ApiResponse<boolean>>('/v1/kyc/liveness/is-expired', { bizNo: bizNo }),
  getSupportedCountries: () =>
    client.get<ApiResponse<ISupportedCountry[]>>('/v1/kyc/support-countries'),
  getKycStatus: () => client.get<ApiResponse<IKycStatus>>('/v1/kyc/status'),
  getKycDetail: () => client.get<ApiResponse<IKycDetail>>('/v1/kyc/detail-result'),
  getKycStepDetail: (step: number) => client.post<ApiResponse<IKycDetail[]>>('/v1/kyc/detail-pending-steps', {steps: [step]}),
  submitKyc: (data: IKycSubmitData) => client.post<ApiResponse<null>>('/v1/kyc/submit', data),
  getFilePutUrl: (mimeType: FilePutMimeType, fileName: string) =>
    client.get<ApiResponse<IFilePutUrlRes>>('/v1/kyc/file-put-url', {
      mimeType: mimeType,
      name: fileName,
    }),
  getFileAccessUrl: (keys: string) =>
    client.get<ApiResponse<IFillAccessUrlRes[]>>('/v1/kyc/file-access-url', { keys: keys }),

  getAgreementsAccepted: () => client.get<ApiResponse<IPrivacyRes>>('/v1/uc/agreements/accepted'),

  postAgreementsAccept: (privacy: string) =>
    client.post<ApiResponse<IPrivacyRes>>('/v1/uc/agreements/accept?privacy=' + privacy),
}
