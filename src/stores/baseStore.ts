import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BaseStore } from './types'
import { baseApi } from "@/service/base/api"
import { MARKET_STATUS, RESPONSE_CODE } from '@/config/constants'
import { marketDefault, marketStateDefault } from './defaultData'
import type { IRwa, IRwaPrice, IToken } from '@/service/base/types'
import { getSecondsSinceMidnight, truncate } from '@/utils'

export const useBaseStore = create<BaseStore>()(
  persist(
    (set, get) => ({
      lastChainId: null,
      lastInitTime: 0,
      count: 0,
      chainList: [],
      tokenList: [],
      rwaList: [],
      stocksList: [],
      marketInfo: marketDefault,
      marketState: marketStateDefault,
      marketTradeState: MARKET_STATUS.DEFAULT,
      getChains: async () => {
        const res = await baseApi.getChains();
        if (res.code === RESPONSE_CODE.SUCCESS) {
          set({ chainList: res.data || [] });
        }
        return res;
      },
      setTokens: (tokenList: IToken[]) => {
        set({tokenList: tokenList})
      },
      setRwas: (rwaList: IRwa[]) => {
        set({rwaList: rwaList})
      },
      getTokens: async (chainId?: number) => {
        const res = await baseApi.getTokens(chainId);
        if (res.code === RESPONSE_CODE.SUCCESS) {
          // 先处理balances
          const _tokenList = (res.data || []).map(token => ({...token, balance: '0'}))
          set({tokenList: _tokenList})
        }
        return res;
      },
      getBaseRwas: async (chainId?: number) => {
        const res = await baseApi.getBaseRwas(chainId);
        if (res.code === RESPONSE_CODE.SUCCESS) {
          set({ rwaList: res.data || [] });
        }
        return res;
      },
      getStocks: async () => {
        const res = await baseApi.getStocks();
        if (res.code === RESPONSE_CODE.SUCCESS) {
          set({ stocksList: res.data || [] });
        }
        return res;
      },
      getMarket: async () => {
        const res = await baseApi.getMarket();
        if (res.code === RESPONSE_CODE.SUCCESS) {
          const marketInfo = {...(res.data || {})}
          let marketState = MARKET_STATUS.DEFAULT
          if (marketInfo.tradingStartTime && marketInfo.tradingEndTime) {
            const nowSecond = getSecondsSinceMidnight()
            if (nowSecond < marketInfo.tradingStartTime) {
              marketState = MARKET_STATUS.BEFORE
            } else if (nowSecond > marketInfo.tradingEndTime) {
              marketState = MARKET_STATUS.AFTER
            } else {
              marketState = MARKET_STATUS.OPEN
            }
            
          }
          set({marketTradeState: marketState})

          set({ marketInfo: marketInfo });
        }
        return res;
      },
      getMarketState: async () => {
        const res = await baseApi.getMarketState();
        if (res.code === RESPONSE_CODE.SUCCESS) {
          
          set({ marketState: res.data || [] });
        }
        return res;
      },
      autoInitialize: async (chainId: number | null) => {
        if (!chainId) return;
        
        if(Date.now() - get().lastInitTime < 1000 * 60 * 60 && get().lastChainId === chainId) {
          console.log('===> autoInitialize, last init time is less than 1 hour')
          return
        }

        await Promise.all([
          get().getTokens(chainId),
          get().getBaseRwas(chainId),
        ]);

        set(() => ({
          lastChainId: chainId,
          lastInitTime: Date.now(),
        }));
      },
      updateRwasPrice: (priceList: IRwaPrice[]) => {
        const rwaList = get().rwaList.map(rwa => {
          const price = priceList.find(price => price.S === rwa.symbol)
          return {
            ...rwa,
            price: truncate(price?.p || 0, rwa.precision),
            up: truncate((price?.o && price?.p ? price.p / price.o - 1 : 0) * 100, 2),
          }
        })
        set({ rwaList: rwaList })
      },
      updateStocksPrice: (priceList: IRwaPrice[]) => {
        const stocksList = get().stocksList.map(stock => {
          const price = priceList.find(price => price.S.startsWith(stock.stockCode))
          return {
            ...stock,
            price: truncate(price?.p || 0, 2),
            up: truncate((price?.o && price?.p ? price.p / price.o - 1 : 0) * 100, 2),
            cPrice: truncate(price?.c || 0, 2),
          }
        })
        set({ stocksList: stocksList })
      }
    }),
    {
      name: "CA_WEB_BASE_INFO",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        count: state.count,
        tokenList: state.tokenList,
        rwaList: state.rwaList,
        lastInitTime: state.lastInitTime,
        lastChainId: state.lastChainId
      }),
    }
  )
);
