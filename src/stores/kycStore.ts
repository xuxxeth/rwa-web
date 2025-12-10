import { create } from 'zustand'
import { kycApi } from '@/service/kyc/api'
import { KYC_RISK_LEVEL, type IKycDetail, type IKycStatus } from '@/service/kyc/types'
import { RISK_STATUS } from '@/config/constants'

interface KycState {
    kycStatus: IKycStatus | null
    kycDetail: IKycDetail | null
    isLoading: boolean
    error: string | null
}

interface KycActions {
    fetchKycStatus: () => Promise<void>
}

export const useKycStore = create<KycActions & KycState>(set => ({
    kycStatus: {status: -1, expiresTime: 0},
    kycDetail: null,
    isLoading: false,
    error: null,
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
        } catch (error: any) {
            set({ error: error.message, isLoading: false })
        }
    },
    // getKycDetail: async () => {
    //     set({ isLoading: true, error: null })
    //     try {
    //         const { data } = await kycApi.getKycStatus()
    //         set({ kycStatus: data || { status: 0, expiresTime: 0 }, isLoading: false })
    //     } catch (error: any) {
    //         set({ error: error.message, isLoading: false })
    //     }
    // },
}))