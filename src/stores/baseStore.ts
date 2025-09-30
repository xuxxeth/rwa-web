import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BaseStore } from './types'
import { baseApi } from '@/service/baseApi'
import { RESPONSE_CODE } from '@/config/constants'
import { marketDefault, marketStateDefault } from './defaultData'
import type { IRwa, IToken } from '@/service/types'


export const useBaseStore = create<BaseStore>()(
  persist(
    (set, get) => ({
      count: 0,
      chainList: [],
      tokenList: [],
      rwaList: [],
      stocksList: [],
      marketInfo: marketDefault,
      marketState: marketStateDefault,
      getChains: async () => {
        const res = await baseApi.getChains()
        if (res.code === RESPONSE_CODE.SUCCESS) {
          set({chainList: res.data || []})
        }
        return res
      },
      setTokens: (tokenList: IToken[]) => {
        set({tokenList: tokenList})
      },
      setRwas: (rwaList: IRwa[]) => {
        set({rwaList: rwaList})
      },
      getTokens: async (chainId?: number) => {
        const res = await baseApi.getTokens(chainId)
        if (res.code === RESPONSE_CODE.SUCCESS) {
          // 先处理balances
          const _tokenList = (res.data || []).map(token => ({...token, balance: '0'}))
          set({tokenList: _tokenList})
        }
        return res
      },
      getBaseRwas: async (chainId?: number) => {
        const res = await baseApi.getBaseRwas(chainId)
        if (res.code === RESPONSE_CODE.SUCCESS) {
          set({rwaList: res.data || []})
        }
        return res
      },
      getStocks: async () => {
        const res = await baseApi.getStocks()
        return res
      },
      getMarket: async () => {
        const res = await baseApi.getMarket()
        if (res.code === RESPONSE_CODE.SUCCESS) {
          set({marketInfo: res.data || []})
        }
        return res
      },
      getMarketState: async () => {
        const res = await baseApi.getMarketState()
        if (res.code === RESPONSE_CODE.SUCCESS) {
          set({marketState: res.data || []})
        }
        return res
      },
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