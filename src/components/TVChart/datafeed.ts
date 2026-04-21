import type {
  Bar,
  LibrarySymbolInfo,
  IBasicDataFeed,
  DatafeedConfiguration,
  ResolutionString,
  PeriodParams,
} from "@/lib/charting_library/charting_library";

import { klineApi } from "@/service/kline/api";
import { MARKET_STATUS, RESPONSE_CODE } from "@/config/constants";
import wsService from "@/service/webSocket/service";
import { truncate } from "@/utils/format";
import type { ISession } from "@/service/kline/types";

// 图表类型	值
// Bars	0
// Candles（K线）	1
// Line	2
// Area	3
// Heikin Ashi	8

export function keyToMinutes(key: string): number {
  const map: Record<string, number> = {
    "1": 1,
    "5": 5,
    "15": 15,
    "30": 30,
    "60": 60,
    "240": 240,
    "1D": 24 * 60,        // 1 day = 1440 minutes
    "1W": 7 * 24 * 60,    // 1 week = 10080 minutes
    // "1M": 30 * 24 * 60,   // 1 month (approx) = 43200 minutes
    "1M": 43200,   // 后端接口配置
  };

  return map[key.toUpperCase()] ?? 15; // 未匹配返回 0
}

export function tagSession(item: any) {
  const date = new Date(item.time * 1000);
  const _hour = date.getUTCHours();
  const _minute = date.getUTCMinutes();

  // 转换到美东时区 (UTC-4 / -5)
  const nyTime = new Date(date.toLocaleString("en-US", { timeZone: "US/Eastern" }));
  // const nyTime = date;
  const h = nyTime.getHours();
  const m = nyTime.getMinutes();
  const totalMin = h * 60 + m;
  if (totalMin >= 240 && totalMin < 570) return "pre";      // 04:00 - 09:30
  if (totalMin >= 570 && totalMin < 960) return "regular";  // 09:30 - 16:00
  if (totalMin >= 960 && totalMin < 1200) return "after";   // 16:00 - 20:00
  return "off"; // 非交易时段
}

export function getSymbol(symbolName: string) {
  if (!symbolName.startsWith('__')) return symbolName
  // 支持 "__BTC_USDT__123456" 这种带下划线的 symbol 包裹格式
  const parts = symbolName.split('__')
  if (parts.length >= 3 && parts[1]) {
    return parts[1]
  }
  return symbolName
}

const lastBarsCache = new Map<string, Bar>();
const barsRangeCache = new Map<string, { from: number; to: number }>();
const minuteResultCache = new Map<string, { bars: any[]; ts: number }>();
const minuteInFlight = new Map<string, Promise<any[]>>();
const sessionCache: ISession[] = [];
const MINUTE_CACHE_TTL = 3000;
const _minPrice: Number = 0;
const _maxPrice: Number = 0;
// DatafeedConfiguration implementation
const configurationData: DatafeedConfiguration = {
  // Represents the resolutions for bars supported by your datafeed
  supported_resolutions: [
    "1",
    "5",
    "15",
    "30",
    "60",
    "4H",
    // "1440",
    '1D', '1W', '1M'
  ] as ResolutionString[],

};

let lastRequestTime = 0;
let currentSymbol = ''
const requestInterval = 1500; // 设置请求时间间隔，单位：毫秒
let hasLoadedInitialData = false;
let subscribeBarOn = ''
let subscribeBarFn: any = undefined
const wsListeners = new Map<string, any>()
const wsSubscriptionVersion = new Map<string, number>()

export type IExtaIBasicDataFeed = IBasicDataFeed & {
  setSessionType: (type: number) => void,
  setCurrentType: (type: number) => void,
  setToken: (token: any) => void,
  getBarsRange: (symbol?: string, resolution?: string) => { from: number; to: number } | undefined,
  setMarketState: (state: number) => void
  setTradingStartTime: (time: number) => void
}

export function getDataFeed({
  pairIndex,
  customPeriodParams,
  name = 'AAPL',
  token
}: any): IExtaIBasicDataFeed {
  let currentToken = token
  let currentChartType = 3;
  let sessionType = 0
  let initialLoadComplete = false;
  let marketState = -1; // 市场状态
  let tradingStartTime = 0; // 交易开始时间
  return {
    setTradingStartTime: (time) => {
      tradingStartTime = time
    },
    setMarketState: (state) => {
      marketState = state
    },
    setSessionType: (type: number) => {
      sessionType = type
    },
    setCurrentType: (type: number) => {
      currentChartType = type
    },
    setToken: (nextToken: any) => {
      currentToken = nextToken
    },
    getBarsRange: (symbol?: string, resolution?: string) => {
      const keySymbol = symbol || currentToken?.symbol
      if (!keySymbol) return undefined
      if (resolution) {
        return barsRangeCache.get(`${keySymbol}|${resolution}`) || barsRangeCache.get(keySymbol)
      }
      return barsRangeCache.get(keySymbol)
    },
    onReady: (callback) => {
      setTimeout(() => callback(configurationData));
    },

    searchSymbols: () => {
    },

    resolveSymbol: async (
      symbolName,
      onSymbolResolvedCallback,
      _onResolveErrorCallback,
      _extension,
    ) => {
      // Symbol information object
      const ticker = symbolName || name || ''
      const symbolInfo: LibrarySymbolInfo = {
        ticker: ticker,
        name: ticker,
        description: ticker,
        type: "stock",
        session: "24x7",
        // timezone: "Asia/Hong_Kong",
        // session: "0930-1601",
        // session: '0400-2000',
        "timezone": "America/New_York",
        minmov: 1,
        pricescale: 100,  // 小数点后2位精度
        exchange: "TIKO",
        has_intraday: true,
        visible_plots_set: 'ohlc',
        has_weekly_and_monthly: true,
        supported_resolutions: configurationData.supported_resolutions,
        volume_precision: 2,
        data_status: "streaming",
        format: "price",
        listed_exchange: "",
      };

      setTimeout(() => onSymbolResolvedCallback(symbolInfo));
    },
    getMarks: async (symbolInfo, from, to, onDataCallback) => {
      // const data = await getChartTable({from: 'getMarks'});
      // const marks = data.table
      //   .filter(d => tagSession(d) !== "regular") // 只标记盘前和盘后
      //   .map(d => ({
      //     id: d.time.toString(),
      //     time: d.time,
      //     color: tagSession(d) === "pre" ? "blue" : "purple",
      //     text: tagSession(d).toUpperCase()
      //   }));
      // @ts-ignore
      onDataCallback([]);
    },
    getBars: async (
      symbolInfo,
      resolution,
      periodParams,
      onHistoryCallback,
      onErrorCallback
    ) => {
      const symbolName = `${symbolInfo?.name || ''}`
      
      if (symbolName.startsWith('__empty__')) {
        
        onHistoryCallback([], { noData: true })
        return
      }
      const currentTime = Date.now();
      // 防止过于频繁的请求
      // if (currentTime - lastRequestTime < requestInterval) {
      //   console.log("请求过于频繁，跳过本次请求");
      //   return;
      // }
      // 更新最后请求时间
      lastRequestTime = currentTime;
      // if (initialLoadComplete) {
      //   return
      // }
      if (symbolInfo.name !== currentSymbol) {
        currentSymbol = symbolInfo.name;
        lastBarsCache.delete(symbolInfo.name);
      } 
      // Use customPeriodParams if needed
      const { from, to, firstDataRequest, countBack } = periodParams
      // area 模式下仅首次加载，后续拖拽/缩放不再请求
      if (currentChartType === 3 && !firstDataRequest) {
        onHistoryCallback([], { noData: true })
        return
      }
      
      // 如果是Kline
      try {
        if (currentChartType !== 3) {
          // if (resolution === '1' && !tradingStartTime) {
          //   onHistoryCallback([], { noData: false })
          //   return
          // }
          const res = await klineApi.getCandles({ stock: currentToken.stockId, interval: keyToMinutes(resolution as any || '15'), endTime: to, limit: countBack })
          const _data = res?.data || []
          if (res.code !== RESPONSE_CODE.SUCCESS || _data.length <= 0) {
            onHistoryCallback([], { noData: true });
            return;
          }
          let endTime = tradingStartTime
          let tmpBars = []
          let bars = _data.reverse().map((bar: any) => {
            tmpBars.push(bar)
            return {
              "time": bar.t * 1000,
              "open": Number(truncate(bar.o, 2)),
              "high": Number(truncate(bar.h, 2)),
              "low": Number(truncate(bar.l, 2)),
              "close": Number(truncate(bar.c, 2)),
              "volume": bar.volume ?? 0,
            }
          })
          // if (resolution === '1') {
          //   bars = bars.filter((bar: any) => bar.time < endTime)
          // }

          let symbolName = getSymbol(symbolInfo.name)
          if (firstDataRequest) {
            lastBarsCache.set(symbolName, { ...bars[bars.length - 1] });
          }
          if (bars.length > 0) {
            const firstTime = bars[0]?.time
            const lastTime = bars[bars.length - 1]?.time
            if (firstTime && lastTime) {
              let fromSec = Math.floor(firstTime / 1000)
              let toSec = Math.floor(lastTime / 1000)
              if (fromSec === toSec) {
                const minutes = keyToMinutes(resolution as any || '15')
                toSec = fromSec + Math.max(minutes, 1) * 60
              }
              barsRangeCache.set(`${symbolName}|${resolution}`, { from: fromSec, to: toSec })
              barsRangeCache.set(symbolName, { from: fromSec, to: toSec })
            }
          }
          onHistoryCallback(bars, { noData: tmpBars.length < countBack ? true : false });
        } else {
          let symbolName = getSymbol(symbolInfo.name)
          const day = parseInt(String(Date.now() / 1000))
          const cacheKey = `${currentToken.stockId}|${sessionType}|${day}|${from}|${to}|${resolution}|${countBack ?? ''}`
          const cached = minuteResultCache.get(cacheKey)
          if (cached && Date.now() - cached.ts < MINUTE_CACHE_TTL) {
            const bars = cached.bars
            if (bars.length === 0) {
              onHistoryCallback([], { noData: true });
            } else {
              onHistoryCallback(bars, { noData: false });
            }
            return;
          }

          if (minuteInFlight.has(cacheKey)) {
            const bars = await minuteInFlight.get(cacheKey)!
            if (bars.length === 0) {
              onHistoryCallback([], { noData: true });
            } else {
              onHistoryCallback(bars, { noData: false });
            }
            return;
          }
          
          const fetchPromise = (async () => {
            
            const res = await klineApi.getMinute({ stock: currentToken.stockId, sessionType })
            const _data = res?.data?.items || []
            let bars = _data
              .sort((a, b) => a.startTime - b.startTime)
              // .filter(bar => bar.startTime >= from && bar.startTime <= to)
              .map((bar: any) => {
                return {
                  "time": bar.startTime * 1000,
                  "open": Number(truncate(bar.close, 2)),
                  "high": Number(truncate(bar.close, 2)),
                  "low": Number(truncate(bar.close, 2)),
                  "close": Number(truncate(bar.close, 2)),
                  "volume": bar.volume ?? 0,
                }
              })

            if (res.code !== RESPONSE_CODE.SUCCESS || bars.length === 0) {
              return []
            }

            // if (typeof countBack === "number" && bars.length < countBack) {
            //   const intervalSec = Math.max(keyToMinutes(resolution as any || '1'), 1) * 60
            //   const intervalMs = intervalSec * 1000
            //   const missing = countBack - bars.length
            //   const firstTimeMs = bars[0]?.time ?? (to * 1000)
            //   const startTimeMs = firstTimeMs - intervalMs * missing
            //   const padBars = Array.from({ length: missing }).map((_, i) => {
            //     const t = startTimeMs + intervalMs * i
            //     return {
            //       time: t,
            //       open: 0,
            //       high: 0,
            //       low: 0,
            //       close: 0,
            //       volume: 0,
            //     }
            //   })
            //   bars = [...padBars, ...bars]
            // }

            return bars
          })()

          minuteInFlight.set(cacheKey, fetchPromise)
          let bars = await fetchPromise
          minuteInFlight.delete(cacheKey)
          minuteResultCache.set(cacheKey, { bars, ts: Date.now() })

          if (bars.length === 0) {
            onHistoryCallback([], { noData: true });
            return;
          }

          if (bars.length > 0) {
            const firstTime = bars[0]?.time
            const lastTime = bars[bars.length - 1]?.time
            if (firstTime && lastTime) {
              let fromSec = Math.floor(firstTime / 1000)
              let toSec = Math.floor(lastTime / 1000)
              if (fromSec === toSec) {
                const minutes = keyToMinutes(resolution as any || '15')
                toSec = fromSec + Math.max(minutes, 1) * 60
              }
              barsRangeCache.set(`${symbolName}|${resolution}`, { from: fromSec, to: toSec })
              barsRangeCache.set(symbolName, { from: fromSec, to: toSec })
            }
          }

          onHistoryCallback(bars, { noData: bars.length === 0 });
        }
        

        // if (!initialLoadComplete) {
        //   initialLoadComplete = true;
        // }
      } catch (error) {
        console.log(error)
        // @ts-ignore
        onErrorCallback(error);
      }
    },

    subscribeBars: (
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
    ) => {
      wsService.init({})
      
      console.log('symbolInfo: ', symbolInfo, resolution)
      if (symbolInfo.name.startsWith('__empty__')) {
        return
      }
      const sub = wsListeners.get(subscriberUID)
      if (sub) {
        wsService.off(sub.key, sub.listener)
        wsListeners.delete(subscriberUID)
      }
      const currentVersion = (wsSubscriptionVersion.get(subscriberUID) || 0) + 1
      wsSubscriptionVersion.set(subscriberUID, currentVersion)
      let _resolution = `${resolution}`
      if (resolution.includes('D') || resolution.includes('W') || resolution.includes('M')) {
        if (!resolution.includes('M')) {
          _resolution = resolution.toLowerCase()
        }
      } else {
        _resolution = _resolution + 'm'
        if (_resolution === '60m') {
          _resolution = '1h'
        }
        if (_resolution === '240m') {
          _resolution = '4h'
        }
      }
      if (currentChartType === 3) {
        _resolution = '1m'
      }
      let symbol = getSymbol(symbolInfo.name)
      
      const key = `candle.${symbol}_${_resolution}`

      const listener = (data: any) => { 
        // 防止旧订阅在 off 延迟期间继续回调
        if (wsSubscriptionVersion.get(subscriberUID) !== currentVersion) {
          return
        }
        const lastBar = lastBarsCache.get(symbol)
        if (data?.c) {
          if (
            (currentChartType === 1 && marketState === MARKET_STATUS.OPEN) // 如果是candle图，则正常执行回调
            || (marketState === MARKET_STATUS.BEFORE && (sessionType === 0 || sessionType === 1)) // 盘前状态，且当前分时图是盘前
            || (marketState === MARKET_STATUS.OPEN && (sessionType === 0 || sessionType === 2)) // 盘中状态，且当前分时图是全部分时和盘中分时
            || (marketState === MARKET_STATUS.AFTER && (sessionType === 0 || sessionType === 3)) // 盘后状态，且当前分时图是盘后和全部分时
            || (marketState === MARKET_STATUS.OVERNIGHT && (sessionType === 0 || sessionType === 5)) // 夜盘状态，且当前分时图是夜盘和全部分时
          ) {
            onRealtimeCallback({
              "time": data.t * 1000,
              "open": Number(truncate(data.o, 2)),
              "high": Number(truncate(data.h, 2)),
              "low": Number(truncate(data.l, 2)),
              "close": Number(truncate(data.c, 2)),
              "volume": 0,
            })
          }
          
        }
      }
      wsListeners.set(subscriberUID, { key, listener })

      // @ts-ignore
      wsService.on(key, listener)
    },
    // @ts-ignore
    unsubscribeBars: (subscriberUID) => {
      wsSubscriptionVersion.set(subscriberUID, (wsSubscriptionVersion.get(subscriberUID) || 0) + 1)
      const sub = wsListeners.get(subscriberUID)
      if (sub) {
        wsService.off(sub.key, sub.listener)
        wsListeners.delete(subscriberUID)
      }
      
    },
  };
}
