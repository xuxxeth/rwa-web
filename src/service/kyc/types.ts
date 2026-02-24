export interface ISupportedCountry {
  code: string
  enName: string
  zhName: string
}

// 0 未认证, 1 认证中, 2 已通过, 3 已拒绝
export const KYC_OVERALL_STATUS = {
  DEFAULT: -1,
  NOTVERIFIED: 0, // 未认证
  VERIFYING: 1, // 认证中
  VERIFIED: 2, // 已通过
  // FAIL: 3,
  EXPIRED: 5, // 已过期
  REJECTED: 6, // 已拒绝
  ISSUE: 9, // 黑名单
}

export type KYC_OVERALL_STATUS = (typeof KYC_OVERALL_STATUS)[keyof typeof KYC_OVERALL_STATUS]

// 2-证件过期，3-交易量触发，4-复审
export const PENDING_STEPS = {
  EXPIRED: 2,
  RISK3: 3,
  REVIEW: 4
}
export type PENDING_STEPS = (typeof PENDING_STEPS)[keyof typeof PENDING_STEPS]
export type PENDING_STEPS_LIST = PENDING_STEPS[]

// -1 未签名 0 未认证, 1 认证中, 2 已通过, 3 已失败, 4 人工审核中, 5 已过期, 6-已拒绝, 7 - 已驳回
export const KYC_STATUS = {
  DEFAULT: -1,
  // NOTVERIFIED: 0, // 未认证
  VERIFYING: 1, // 认证中
  VERIFIED: 2, // 已通过
  // FAIL: 3, // 已失败
  REVIEW: 4, // 人工审核中
  EXPIRED: 5, // 已过期
  REJECTED: 6, // 已拒绝
  DECLINED: 7, // 已驳回
  
}
export type KYC_STATUS = (typeof KYC_STATUS)[keyof typeof KYC_STATUS]
export type KYC_GENDER = 0 | 1 // 0 女, 1 男
export type KYC_ID_TYPE = 0 | 1 // 0 身份证 1 护照

export const KYC_RISK_LEVEL = {
  LOW: 1,
  MIDDLE: 2,
  HIGH: 3,
} // 1 低风险 2 中风险 3 高风险
export type KYC_RISK_LEVEL = (typeof KYC_RISK_LEVEL)[keyof typeof KYC_RISK_LEVEL]

export const KYC_VERIFY_TYPE = {
  BASIC: 'BASIC_INFO',
  INCOME: 'INCOME',
  OCR: 'OCR',
  LIVENESS: 'LIVENESS',
  AML: 'AML',
  KYT: 'KYT',
  ID_INFO: 'ID_INFO',
}
export type KYC_VERIFY_TYPE = (typeof KYC_VERIFY_TYPE)[keyof typeof KYC_VERIFY_TYPE]

export const KYC_PENDING_MATERIALS = {
  INCOME: 'income-certificate',
  ADDRESS: 'address-certificate',
  EXTRA: 'extra-documents',
}
export type KYC_PENDING_MATERIALS =
  (typeof KYC_PENDING_MATERIALS)[keyof typeof KYC_PENDING_MATERIALS]

export interface IKycStatus {
  status: KYC_STATUS
  expiresTime: number // 过期时间，毫秒
  pendingSteps: PENDING_STEPS_LIST
}

export interface ILivenessUrlRes {
  url?: string
  expireTime?: number // 活体校验 URL 过期时间，毫秒
  leftAvailableTimes: number
  bizNo?: string
  errorMsg?: string
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
  userInfo?: IKycSubmitData
  overallStatus: KYC_OVERALL_STATUS
  applyStatus: KYC_OVERALL_STATUS
  riskLevel?: KYC_RISK_LEVEL
  verifyType?: KYC_VERIFY_TYPE
  pendingMaterials?: KYC_PENDING_MATERIALS
  status?: KYC_STATUS
  rejectReason?: string
  expiresTime?: number
  expireTime?: number
}

export interface IKycSubmitData {
  type: number // 1-首次KYC 2-证件过期 3-交易量检查 4-复查
  basicInfo: IBasicInfo
  idInfo: IIdInfo & {
    files: {
      [key: string]: string
    }
  }
  workInfo: IEmploymentInfo
  incomeInfo: IIncomeInfo
  extraInfo: IExtraInfo
  approvedProtocols?: string[]
  reviewInfo?: {
    reviewCommentToUser: string
  }
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

export interface IPrivacyRes {
  privacy: string
}
