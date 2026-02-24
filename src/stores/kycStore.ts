import { create } from 'zustand'
import { kycApi } from '@/service/kyc/api'
import { KYC_STATUS, type IKycDetail } from '@/service/kyc/types'
import { type KycStore } from './types'
import { riskApi } from '@/service/risk/api'

export const useKycStore = create<KycStore>((set, get) => ({
  kycStatus: { status: -1, expiresTime: 0, pendingSteps: [] },
  kycDetail: null,
  isLoading: false,
  error: null,
  riskUserConfig: null,
  retryCount: 0,
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
    const oldKyDetail = get().kycDetail
    if (kycDetail.overallStatus !== kycStatus?.status || kycDetail.status !== oldKyDetail?.status) {
      await Promise.all([fetchKycStatus(), getUserConfig()])
    }
  },
  fetchKycStatus: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await kycApi.getKycStatus()
      
      set({ kycStatus: data || { status: 0, expiresTime: 0, pendingSteps: [] }, isLoading: false })

      // 如果是认证中\已过期\驳回
      if (data && (data.status === KYC_STATUS.VERIFYING || data.status === KYC_STATUS.EXPIRED || data.status === KYC_STATUS.DECLINED)) {
        const { data } = await kycApi.getKycDetail()
        set({ kycDetail: data })
      } else {
        set( {kycDetail: null })
      }

      if (data && data.pendingSteps?.length > 0) {
        // 如果有子流程
        if (data.pendingSteps?.length > 0) {
          const stepRes = await kycApi.getKycStepDetail(data.pendingSteps[0])
          const stepData = stepRes.data[0] ? stepRes.data[0] : {}
          // @ts-ignore
          stepData.overallStatus = stepData.applyStatus || res.data?.overallStatus
          // @ts-ignore
          set({ kycDetail: stepData })
        } else {
          set( {kycDetail: null })
        }
      }
      
    } catch (error: any) {
      set({ kycStatus: { status: 0, expiresTime: 0, pendingSteps: [] }, isLoading: false })
      set( {kycDetail: null })
      set({ error: error.message, isLoading: false })
    }
  },
  updateRetryCount: (count: number) => {
    set({retryCount: count})
  }
}))
