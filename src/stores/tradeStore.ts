import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TradeStore } from './types'

import type { IRwa, IToken } from '@/service/base/types'

export const useTradeStore = create<TradeStore>()(
  persist(
    (set, get) => ({
      inputToken: null,
      outputToken: null,
      limitPrice: '0',
      inputSize: '0',
      expires: 7,
      updateInputToken: (rwa: IRwa) => {
        set({inputToken: rwa})
      },
      updateOutputToken: (token: IToken) => {
        set({outputToken: token})
      },
      updateLimitPrice: (price: string) => {
        set({limitPrice: price})
      },
      updateInputSize: (size: string) => {
        set({inputSize: size})
      },
      updateExpires: (expires: number) => {
        set({expires: expires})
      }
      
    }),
    {
      name: "CA_WEB_TRADE_INFO",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        
      }),
    }
  )
);
