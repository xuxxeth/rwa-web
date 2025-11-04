import { create } from 'zustand'
import type { RiskSTore } from './types'

import { riskApi } from '@/service/risk/api';

export const useRiskStore = create<RiskSTore>()(
    (set, get) => ({
      riskUserConfig: null,
      getUserConfig: async () => {
        const res = await riskApi.getUserConfig()
        console.log(res)
        if (res.code === 9401) {
          set({riskUserConfig: { actions: -1, verifyType: 2, verifyState: 2, blacklist: true}})
        } else {
          set({riskUserConfig: res.data || {}})
        }
        
        return res
      },
      
    }),
    
);
