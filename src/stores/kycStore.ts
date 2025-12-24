import { create } from 'zustand'
import { kycApi } from '@/service/kyc/api'
import { type IKycDetail } from '@/service/kyc/types'
import { RISK_STATUS } from '@/config/constants'
import { type KycStore } from './types'
import { riskApi } from '@/service/risk/api'

export const useKycStore = create<KycStore>((set, get) => ({
  kycStatus: { status: -1, expiresTime: 0, pendingSteps: [] },
  kycDetail: null,
  isLoading: false,
  error: null,
  riskUserConfig: null,
  getUserConfig: async () => {
    const res = await riskApi.getUserConfig()
    if (res.code === 9401) {
      set({ riskUserConfig: { actions: -1, verifyType: 2, verifyState: 2, blacklist: true } })
    } else {
      set({ riskUserConfig: res.data || {} })
    }

    return res
  },
  refetchKycStatusAndConfigIfNeed: async (kycDetail: IKycDetail) => {
    const { kycStatus, fetchKycStatus, getUserConfig } = get()
    if (kycDetail.overallStatus !== kycStatus?.status) {
      await Promise.all([fetchKycStatus(), getUserConfig()])
    }
  },
  fetchKycStatus: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await kycApi.getKycStatus()
      
      set({ kycStatus: data || { status: 0, expiresTime: 0 }, isLoading: false })

      // 如果是认证中和已拒绝，则请求认证结果详情接口
      if (data && (data.status === RISK_STATUS.VERIFYING || data.status === RISK_STATUS.REJECTED)) {
        const { data } = await kycApi.getKycDetail()
        set({ kycDetail: data })
      }
      // 如果有子流程
      if (data.pendingSteps.length > 0) {
        const stepRes = await kycApi.getKycStepDetail(data.pendingSteps[0])
        const stepData = stepRes.data[0] ? stepRes.data[0] : {}
        // @ts-ignore
        stepData.overallStatus = stepData.applyStatus || res.data?.overallStatus
        // @ts-ignore
        set({ kycDetail: stepData })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
}))
