import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BaseStore } from './types'
import { baseApi } from '@/service/base/api'
import { MARKET_STATUS, RESPONSE_CODE } from '@/config/constants'
import { marketDefault, marketStateDefault } from './defaultData'
import type {
  IRwa,
  IRwaPrice,
  IToken,
  ITokenWithBalance,
  ITokenWithPrice,
  IStockWithPrice,
} from '@/service/base/types'
import { truncate, checkSymbolEqual, symbolToLower, getEasternSecondsSinceMidnight } from '@/utils'

const ENABLE_CACHE = true
// 缓存时间，2小时
const CACHE_TIME = 1000 * 60 * 60 * 2

export const useBaseStore = create<BaseStore>()(
  persist(
    (set, get) => ({
      currentWallet: null,
      lastChainId: null,
      lastInitTime: 0,
      chainList: [],
      tokenList: [],
      rwaList: [],
      stocksList: [],
      marketInfo: marketDefault,
      marketState: marketStateDefault,
      marketTradeState: MARKET_STATUS.DEFAULT,
      freshTokenBalancesCount: 1,
      // TODO: 使用 Map 可能性能更好?
      // token 余额
      tokenWithBalance: {},
      setCurrentWallet: (wallt: any) => {
        set({ currentWallet: wallt })
      },
      setTokenWithBalance: (tokenWithBalance: Record<string, ITokenWithBalance>) => {
        set({ tokenWithBalance: tokenWithBalance })
      },

      // token 价格
      tokenWithPrice: {},
      // 更新 token 价格
      setTokenWithPrice: (tokenWithPrice: Record<string, ITokenWithPrice>) => {
        set({ tokenWithPrice: tokenWithPrice })
      },
      // 使用 websocket 数据更新 token 价格
      setTokenWithPriceByWebSocketData: (data: IRwaPrice[]) => {
        const rwaList = get().rwaList
        if (rwaList.length === 0) return
        const tokenWithPrices: Record<string, ITokenWithPrice> = data.reduce(
          (acc, cur) => {
            const rwa = rwaList.find(item => checkSymbolEqual(item.symbol, cur.S))
            if (rwa) {
              acc[symbolToLower(cur.S)] = {
                price: truncate(cur.p || 0, rwa.precision),
                up: truncate((cur?.pc && cur?.p ? cur.p / cur.pc - 1 : 0) * 100, 2),
                dailyHigh: truncate(cur?.h || 0, rwa.precision),
              }
            }
            return acc
          },
          {} as Record<string, ITokenWithPrice>
        )
        set({ tokenWithPrice: tokenWithPrices })
      },

      // 股票价格
      stockWithPrice: {},
      setStockWithPrice: (stockWithPrice: Record<string, IStockWithPrice>) => {
        set({ stockWithPrice: stockWithPrice })
      },
      // 使用 websocket 数据更新股票价格
      setStockWithPriceByWebSocketData: (data: IRwaPrice[]) => {
        const stocksList = get().stocksList
        if (stocksList.length === 0) return
        const stockWithPrices: Record<string, IStockWithPrice> = data.reduce(
          (acc, cur) => {
            const stock = stocksList.find(item => checkSymbolEqual(item.stockCode, cur.S))
            if (stock) {
              acc[symbolToLower(cur.S)] = {
                price: truncate(cur?.p || 0, 2),
                up: truncate((cur?.pc && cur?.p ? cur.p / cur.pc - 1 : 0) * 100, 2),
                cPrice: truncate(cur?.c || 0, 2),
              }
            }
            return acc
          },
          {} as Record<string, IStockWithPrice>
        )
        set({ stockWithPrice: stockWithPrices })
      },

      getChains: async () => {
        const res = await baseApi.getChains()
        if (res.code === RESPONSE_CODE.SUCCESS) {
          set({ chainList: res.data || [] })
        }
        return res
      },
      setTokens: (tokenList: IToken[]) => {
        set({ tokenList: tokenList })
      },
      setRwas: (rwaList: IRwa[]) => {
        set({ rwaList: rwaList })
      },
      getTokens: async (chainId?: number) => {
        const res = await baseApi.getTokens(chainId)
        set({ tokenList: res.data || [] })
        return res
      },
      getBaseRwas: async (chainId?: number) => {
        const res = await baseApi.getBaseRwas(chainId)
        if (res.code === RESPONSE_CODE.SUCCESS) {
          set({ rwaList: res.data || [] })
        }
        return res
      },
      getStocks: async () => {
        const res = await baseApi.getStocks()
        if (res.code === RESPONSE_CODE.SUCCESS) {
          set({ stocksList: res.data || [] })
        }
        return res
      },
      getMarket: async () => {
        const res = await baseApi.getMarket()
        if (res.code === RESPONSE_CODE.SUCCESS) {
          const marketInfo = { ...(res.data || {}) }
          // let marketState = MARKET_STATUS.DEFAULT
          // if (marketInfo.tradingStartTime && marketInfo.tradingEndTime) {
          //   const nowSecond = getEasternSecondsSinceMidnight();
          //   if (nowSecond < marketInfo.tradingStartTime - marketInfo.preMarketMinutes) {
          //     marketState = MARKET_STATUS.BEFORE;
          //   } else if (nowSecond > marketInfo.tradingEndTime + marketInfo.afterMarketMinutes) {
          //     marketState = MARKET_STATUS.AFTER;
          //   } else {
          //     marketState = MARKET_STATUS.OPEN
          //   }
          // }
          // set({ marketTradeState: marketState })

          set({ marketInfo: marketInfo })
        }
        return res
      },
      getMarketState: async () => {
        const res = await baseApi.getMarketState()
        if (res && res.code === RESPONSE_CODE.SUCCESS) {
          const _data = res.data || {}
          let marketState = MARKET_STATUS.CLOSE
          if ((_data.tradingDayType === 4 || _data.tradingDayType === 5) && _data.status === 3) {
            marketState = MARKET_STATUS.OPEN
          }
          set({ marketState: _data, marketTradeState: marketState })
        }
        return res
      },
      init: async (chainId: number | null) => {
        if (!chainId) return

        if (
          ENABLE_CACHE &&
          Date.now() - get().lastInitTime < CACHE_TIME &&
          get().lastChainId === chainId
        ) {
          console.log(`ChainId: ${chainId}, init, last init time is less than 2 hours`)
          return
        }

        await Promise.all([
          get().getChains(),
          get().getTokens(chainId),
          get().getBaseRwas(chainId),
          get().getStocks(),
          get().getMarket(),
          // get().getMarketState(),
        ])
        set(() => ({
          lastChainId: chainId,
          lastInitTime: Date.now(),
        }))
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
      },
      freshTokenBalances: () => {
        set({ freshTokenBalancesCount: get().freshTokenBalancesCount + 1 })
      },
    }),
    {
      name: 'CA_WEB_BASE_INFO',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // tokenList: state.tokenList,
        // rwaList: state.rwaList,
        // chainList: state.chainList,
        // stocksList: state.stocksList,
        // marketInfo: state.marketInfo,
        // marketState: state.marketState,
        // marketTradeState: state.marketTradeState,
        // lastInitTime: state.lastInitTime,
        // lastChainId: state.lastChainId,
      }),
    }
  )
)
