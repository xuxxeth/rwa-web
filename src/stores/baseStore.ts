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
  IChain,
  IMarketState,
} from '@/service/base/types'
import { truncate, checkSymbolEqual, symbolToLower, getEasternSecondsSinceMidnight, calculateUp, subtract, divide, multiply, calculateTruncateUP, numberToBinaryArray } from '@/utils'
import { WSS_MARKET_STATUS, type IWSSMarketState } from '@/service/webSocket/service'

const ENABLE_CACHE = false
// 缓存时间，2小时
const CACHE_TIME = 1000 * 60 * 60 * 2

export const useBaseStore = create<BaseStore>()(
  persist(
    (set, get) => ({
      connectInit: false,
      showConnect: false,
      currentWallet: null,
      currentChain: null,
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
      tokenWithBalance: {},
      setConnectInit: (init: boolean) => {
        set({ connectInit: init })
      },
      setShowConnect: (show: boolean) => {
        set({ showConnect: show })
      },
      setCurrentWallet: (wallt: any) => {
        set({ currentWallet: wallt })
      },
      setCurrentChain: (chain: IChain | null) => {
        set({ currentChain: chain })
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
                closePrice: truncate(cur.c || 0, rwa.precision),
                price: truncate(cur.p || 0, rwa.precision),
                upValue: truncate(subtract(cur.p ?? '0', (cur.o ?? '0')), 2),
                up: cur.p && cur.o ? calculateUp(cur.p, cur.o) : '0.00',
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
                up: calculateUp((cur?.p && cur?.o ? cur.p / cur.o - 1 : 0) * 100, 2),
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
          const rwaList = (res.data || []).map(rwa => ({
            ...rwa,
            is24H: rwa.sessionMask === 15,
            sessionMaskList: numberToBinaryArray(rwa.sessionMask ?? 0),
          }))
          set({ rwaList: rwaList })
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
          const marketInfo = {...(res.data || {}) }
          
          set({ marketInfo: {...marketInfo, minAmountPerOrder: marketInfo.minAmountPerOrder || "20", maxAmountPerOrder: marketInfo.maxAmountPerOrder || "500000" } })
        }
        return res
      },
      setMarketState: (data: IWSSMarketState) => {
        
        let marketState = MARKET_STATUS.CLOSE
        // 盘中
        if (data.s === WSS_MARKET_STATUS.OPEN) {
          marketState = MARKET_STATUS.OPEN
        }
        // 盘前
        if (data.s === WSS_MARKET_STATUS.BEFORE) { 
          marketState = MARKET_STATUS.BEFORE
        }
        // 盘后
        if (data.s === WSS_MARKET_STATUS.AFTER) { 
          marketState = MARKET_STATUS.AFTER
        }
        // 夜盘
        if (data.s === WSS_MARKET_STATUS.OVERNIGHT) { 
          marketState = MARKET_STATUS.OVERNIGHT
        }
        
        const _marketState = {
          "market": data.m, // us
          "desc": "",
          "tradingDayType": data.d, // 0-非交易日，1-全天交易市，2-上半日市，3-下半日市
          "status": data.s,
          "availability": {
            "trading": 0,
            "pre_after_trading": 0,
          },
          "L": data.L, // 是否允许限价单
          "M": data.M, // 是否允许市价单
        }
        set({ marketState: _marketState, marketTradeState: marketState })
      },
      getMarketState: async () => {
        const marketState = get().marketState
        if (marketState && marketState.status !== MARKET_STATUS.DEFAULT) {
          return { code: RESPONSE_CODE.SUCCESS, data: marketState, message: null }
        }
        const res = await baseApi.getMarketState()
        if (res && res.code === RESPONSE_CODE.SUCCESS) {
          const _data = res.data || {}
          let marketState = MARKET_STATUS.CLOSE
          if ((_data.tradingDayType === 4 || _data.tradingDayType === 5))  {
            // 盘中
            if (_data.status === 3) {
              marketState = MARKET_STATUS.OPEN
            }
            // 盘前
            if (_data.status === 2) { 
              marketState = MARKET_STATUS.BEFORE
            }
            // 盘后
            if (_data.status === 6) { 
              marketState = MARKET_STATUS.AFTER
            }
            // 已收盘
            if (_data.status === 7) { 
              marketState = MARKET_STATUS.CLOSE // 这里应该是跟 CLOSED 区分开一个状态的，但目前前端只区分了闭市和开市，所以先放在一起
            }
            // 夜盘
            if (_data.status === 12) { 
              marketState = MARKET_STATUS.OVERNIGHT
            }
          }
          
          // marketState = MARKET_STATUS.AFTER
          set({ marketState: { ..._data, status: marketState }, marketTradeState: marketState })
        }
        return res
      },
      init: async (chainId: number | null) => {
        console.log(chainId, 1111)
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
          get().getTokens(chainId),
          get().getBaseRwas(chainId),
          get().getStocks(),
          get().getMarket(),
        ])
        set(() => ({
          lastChainId: chainId,
          lastInitTime: Date.now(),
        }))
      },
      refreshByLanguage: async () => {
        const chainId = get().lastChainId
        if (chainId) {
          await get().getBaseRwas(chainId)
        }
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
        tokenList: state.tokenList,
        rwaList: state.rwaList,
        chainList: state.chainList,
        stocksList: state.stocksList,
        marketInfo: state.marketInfo,
        lastInitTime: state.lastInitTime,
        lastChainId: state.lastChainId,
      }),
    }
  )
)
