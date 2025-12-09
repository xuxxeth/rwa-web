export interface ISupportedCountry {
  key: string
  value: string
}

// 0 未认证, 1 认证中, 2 已通过, 3 已拒绝, 4 人工审核中
export type KYC_OVERALL_STATUS = 0 | 1 | 2 | 3 | 4
// 0 未认证, 1 认证中, 2 已通过, 3 已失败, 4 人工审核中, 5 已过期, 6-已拒绝
export type KYC_STATUS = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type KYC_GENDER = 0 | 1 // 0 女, 1 男
export type KYC_ID_TYPE = 0 | 1 // 0 身份证 1 护照
export type KYC_RISK_LEVEL = 1 | 2 | 3 // 1 低风险 2 中风险 3 高风险

export type KYC_VERIFY_TYPE = 'basic-info' | 'ocr' | 'liveness' | 'aml' | 'kyt'

export type KYC_PENDING_MATERIALS = 'income-certificate' | 'address-certificate' | 'extra-documents'

export interface IKycStatus {
  status: KYC_STATUS
  expiresTime: number // 过期时间，毫秒
}

export interface ILivenessUrlRes {
  url: string
  expireTime: number // 活体校验 URL 过期时间，毫秒
  leftAvailableTimes: number
}

export interface IBasicInfo {
    firstName: string
    lastName: string
    fullName: string
    gender: number
    dob: string
    email: string
}

export interface IIdInfo {
    type: number
    issueCountry: string
    no: string
    residentAddress?: string
    useCertificateAddress?: boolean
}

export interface IEmploymentInfo {
    employment: number
    description?: string
}

export interface IIncomeInfo {
    source: number
}

export interface IExtraInfo {
    incomeCertifications: string[]
}

export interface IKycDetail {
  account: string
  userInfo?: {
    basicInfo: IBasicInfo
    idInfo: IIdInfo
    employmentInfo: IEmploymentInfo
    // 等后端确定，暂时还不太确定
    approvedProtocols: string[]
  }
  overallStatus: KYC_OVERALL_STATUS
  riskLevel?: KYC_RISK_LEVEL
  verifyType?: KYC_VERIFY_TYPE
  pendingMaterials?: KYC_PENDING_MATERIALS
  status?: KYC_STATUS
  rejectReason?: string
  expiresTime?: number
}

export interface IKycSubmitData {
    basicInfo: IBasicInfo
    idInfo: IIdInfo & {
        files: {
            [key: string]: string,
        }
    }
    workInfo: IEmploymentInfo
    incomeInfo: IIncomeInfo
    extraInfo: IExtraInfo
    approvedProtocols: string[]
    // TODO: 待补充其他字段
}

export interface IUploadResponse {
  name: string
  key: string
  url: string
}

export type FilePutMimeType = 'application/pdf' | 'image/jpeg' | 'image/png'

export interface IFilePutUrlRes {
  key: string
  url: string
  expiration: number // 过期时间，毫秒
}

export interface IFillAccessUrlRes {
  key: string
  url: string
  expiration: number
}
