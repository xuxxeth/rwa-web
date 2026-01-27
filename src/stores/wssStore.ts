import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { WssStore } from './types'

import type { IRwa, IRwaPrice, IToken, ITokenWithPrice } from '@/service/base/types'
import { checkSymbolEqual, symbolToLower, truncate } from '@/utils';
import { useBaseStore } from './baseStore';
import type { ICandlesParams } from '@/service/kline/types';
import { klineApi } from '@/service/kline/api';
import type { IOrderData, ISummaryDataItem } from '@/service/webSocket/types';

export const useWssStore = create<WssStore>()(
  persist(
    (set, get) => ({
      priceInitialized: false,
      stableTokenWithPrice: {},
      tokenWithPrice: {},
      newOrder: null,
      originSummary: [],
      setStableTokenWithPrice: (data: IRwaPrice[]) => {
        const { priceInitialized } = get();
        if (priceInitialized) return; // 

        const rwaList = useBaseStore.getState().rwaList;
        if (rwaList.length === 0) return;
        const tokenWithPrices: Record<string, ITokenWithPrice> = data.reduce(
          (acc, cur) => {
            const rwa = rwaList.find((item) =>
              checkSymbolEqual(item.symbol, cur.S)
            );
            if (rwa) {
              acc[symbolToLower(cur.S)] = {
                price: truncate(cur.p || 0, rwa.precision),
                up: truncate(
                  (cur?.o && cur?.p ? cur.p / cur.o - 1 : 0) * 100,
                  2
                ),
                dailyHigh: truncate(cur?.h || 0, rwa.precision),
              };
            }
            return acc;
          },
          {} as Record<string, ITokenWithPrice>
        );
        set({ stableTokenWithPrice: tokenWithPrices, priceInitialized: true });
      },
      
      getCandles: async (params: ICandlesParams) => {
        const res = klineApi.getCandles(params)
        return res
      },
      updateNewOrder: (order: IOrderData) => {
        set({ newOrder: { ...order } })
      },
      updateOriginSummary: (data: ISummaryDataItem[]) => {
        set({ originSummary: data })
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
