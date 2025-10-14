import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { WssStore } from './types'

import type { IRwa, IRwaPrice, IToken, ITokenWithPrice } from '@/service/base/types'
import { checkSymbolEqual, symbolToLower, truncate } from '@/utils';
import { useBaseStore } from './baseStore';

export const useWssStore = create<WssStore>()(
  persist(
    (set, get) => ({
      priceInitialized: false,
      stableTokenWithPrice: {},
      tokenWithPrice: {},
      
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
      
      
    }),
    {
      name: "CA_WEB_TRADE_INFO",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        
      }),
    }
  )
);
