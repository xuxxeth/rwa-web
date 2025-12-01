import { create } from 'zustand'
import { kycApi } from '@/service/kyc/api'
import type { IKycStatus } from '@/service/kyc/types'

interface KycState {
    kycStatus: IKycStatus | null
    isLoading: boolean
    error: string | null
}

interface KycActions {
    fetchKycStatus: () => Promise<void>
}

export const kycStore = create<KycActions & KycState>(set => ({
    kycStatus: null,
    isLoading: false,
    error: null,
    fetchKycStatus: async () => {
        set({ isLoading: true, error: null })
        try {
            const { data } = await kycApi.getKycStatus()
            set({ kycStatus: data, isLoading: false })
        } catch (error: any) {
            set({ error: error.message, isLoading: false })
        }
    },
}))