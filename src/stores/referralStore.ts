import { RESPONSE_CODE } from '@/config/constants'
import { baseApi } from '@/service/base/api'
import type { IMarketState } from '@/service/base/types'
import type { ApiResponse } from '@/service/client'
import { referralApi } from '@/service/referral/api'
import type { IRelationshipInfo } from '@/service/referral/types'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type IStockData = {
  marketCap: string,
  circCap: string,
  peTtm: string,
  peStatic: string,
  pb: string
}

export interface ReferralStore {
  relationship: IRelationshipInfo | null
  getRelationship: () => void
  bindRelationship: (inviteCode: string) => Promise<ApiResponse<null>>
}

export const useReferralStore = create<ReferralStore>()(

  persist((set, get) => ({
    relationship: null,
    getRelationship: async () => {
      const res = await referralApi.getRelationship()
      if (res.code === RESPONSE_CODE.SUCCESS) {
        set({ relationship: res.data || null })
      }
    },
    bindRelationship: async (inviteCode: string) => {
      const res = await referralApi.bindRelationship(inviteCode)
      if (res.code === RESPONSE_CODE.SUCCESS) {
        await get().getRelationship() // 绑定成功后刷新关系信息
      }
      return res
    },
  }), 
  {
    name: "CA_WEB_Referral",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
    }),
  })
)