import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BaseStore } from './types'
import { baseApi } from '@/service/baseApi'


export const baseStore = create<BaseStore>()(
  persist(
    (set, get) => ({
      count: 0,
      getChains: async () => {
        const res = await baseApi.getChains()
        console.log(res)
        return res
      }
    }),
    {
      name: 'CA_WEB_BASE_INFO',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        count: state.count
      })
    }
  ),
  
)