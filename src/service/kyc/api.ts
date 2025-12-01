import client, { type ApiResponse } from "../client";
import type { ISupportedCountry, IKycStatus, IKycDetail, IKycSubmitData, IUploadResponse, FilePutMimeType, IFilePutUrlRes, IFillAccessUrlRes } from './types'

export const kycApi = {
    getSupportedCountries: () => client.get<ApiResponse<ISupportedCountry[]>>('/v1/kyc/support-countries'),
    getKycStatus: () => client.get<ApiResponse<IKycStatus>>('/v1/kyc/status'),
    getKycDetail: () => client.get<ApiResponse<IKycDetail>>('/v1/kyc/detail-result'),
    submitKyc: (data: IKycSubmitData) => client.post<ApiResponse<null>>('/v1/kyc/submit', data),
    getFilePutUrl: (mimeType: FilePutMimeType, fileName: string) => client.get<ApiResponse<IFilePutUrlRes>>('/v1/kyc/file-put-url', {
        mimeType: mimeType,
        name: fileName
    }),
    getFileAccessUrl: (keys: string) => client.get<ApiResponse<IFillAccessUrlRes[]>>('/v1/kyc/file-access-url', { keys: keys })
}