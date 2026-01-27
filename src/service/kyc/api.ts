import { RESPONSE_CODE } from '@/config/constants'
import client, { isTiko, type ApiResponse } from '../client'
import {
  type ISupportedCountry,
  type IKycStatus,
  type IKycDetail,
  type IKycSubmitData,
  type FilePutMimeType,
  type IFilePutUrlRes,
  type ILivenessUrlRes,
  type IPrivacyRes,
  KYC_STATUS,
  KYC_OVERALL_STATUS,
} from './types'

export const kycApi = {
  getLivenessUrl: (step: number = 1) =>
    client.get<ApiResponse<ILivenessUrlRes>>('/v1/kyc/api/liveness/create-liveness-url', {
      type: step,
    }),
  validateLivenessImage: (s3Key: string, step: number) =>
    client.get<ApiResponse<boolean>>('/v1/kyc/api/liveness/validate-image', { key: s3Key, type: step }),
  isLivenessUrlExpired: (bizNo: string) =>
    client.get<ApiResponse<boolean>>('/v1/kyc/api/liveness/is-expired', { bizNo: bizNo }),
  getSupportedCountries: () =>
    client.get<ApiResponse<ISupportedCountry[]>>('/v1/kyc/public/support-countries'),
  getKycStatus: () => client.get<ApiResponse<IKycStatus>>('/v1/kyc/api/status') 
  // : ({
  //     code: RESPONSE_CODE.SUCCESS,
  //     data: {
  //       status: KYC_OVERALL_STATUS.VERIFIED,
  //       expiresTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
  //       pendingSteps: [],
  //     },
  //     message: null,
  //   })
  ,
  
  getKycDetail: () => client.get<ApiResponse<IKycDetail>>('/v1/kyc/api/detail-result') 
  // : ({
  //     code: RESPONSE_CODE.SUCCESS,
  //     data: {
  //       overallStatus: KYC_OVERALL_STATUS.VERIFIED,
  //       applyStatus: KYC_OVERALL_STATUS.VERIFIED,
  //       status: KYC_STATUS.VERIFIED,
  //       expiresTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
  //     },
  //     message: null,
  //   })
  ,
  getKycStepDetail: (step: number) =>
    client.post<ApiResponse<IKycDetail[]>>('/v1/kyc/api/detail-pending-steps', { steps: [step] }),
  submitKyc: (data: IKycSubmitData) => client.post<ApiResponse<null>>('/v1/kyc/api/submit', data),
  getFilePutUrl: (mimeType: FilePutMimeType, fileName: string) =>
    client.get<ApiResponse<IFilePutUrlRes>>('/v1/kyc/api/file-put-url', {
      mimeType: mimeType,
      name: fileName,
    }),

  getAgreementsAccepted: () => client.get<ApiResponse<IPrivacyRes>>('/v1/uc/api/agreements/accepted'),

  postAgreementsAccept: (privacy: string, userService: string) =>
    client.post<ApiResponse<IPrivacyRes>>('/v1/uc/api/agreements/accept?privacy=' + privacy + '&user-service=' + userService, {privacy, 'user-service': userService}),
}
