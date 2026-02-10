import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TradeStore } from './types'

import type { IRwa, IToken } from '@/service/base/types'
import type { ISummaryDataItem } from '@/service/webSocket/types';

export const useTradeStore = create<TradeStore>()(
  persist(
    (set, get) => ({
      realtimeRwaData: null,
      inputToken: null,
      outputToken: null,
      limitPrice: '',
      inputSize: '',
      expires: 7,
      activeConvertTab: 'buy' as const,
      isSignatureValid: false,
      txStep: 0,
      txError: '',
      txSuccess: {type: '', msg: '', tx: ''},
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
      },
      setIsSignatureValid: (valid: boolean) => {
        set({isSignatureValid: valid})
      },
      setTxStep: (step: number) => {
        set({txStep: step})
      },
      setTxError: (str: string) => {
        set({txError: str})
      },
      setTxSuccess: (type: string, msg: string, tx: string) => {

        set({txSuccess: { type, msg, tx }})
      },
      setRealtimeRwaData: (data: ISummaryDataItem | null) => {
        set({realtimeRwaData: data})
      }
    }),
    {
      name: "CA_WEB_TRADE_INFO",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // inputToken: state.inputToken,
        outputToken: state.outputToken,
      }),
    }
  )
);
