import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TradeStore } from './types'

import type { IRwa, IToken } from '@/service/base/types'

export const useTradeStore = create<TradeStore>()(
  persist(
    (set, get) => ({
      inputToken: null,
      outputToken: null,
      limitPrice: '',
      inputSize: '',
      expires: 7,
      activeConvertTab: 'buy',
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
      },
      updateActiveConvertTab: (tab: 'buy' | 'sell') => {
        set({activeConvertTab: tab})
      }
    }),
    {
      name: "CA_WEB_TRADE_INFO",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        inputToken: state.inputToken,
        outputToken: state.outputToken,
      }),
    }
  )
);
