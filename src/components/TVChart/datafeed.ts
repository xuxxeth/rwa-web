import type {
  Bar,
  LibrarySymbolInfo,
  IBasicDataFeed,
  DatafeedConfiguration,
  ResolutionString,
  PeriodParams,
} from "@/lib/charting_library/charting_library";

import { klineApi } from "@/service/kline/api";
import { RESPONSE_CODE } from "@/config/constants";
import wsService from "@/service/webSocket/service";
import { truncate } from "@/utils/format";

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
    "1M": 40320,   // 后端接口配置
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

const lastBarsCache = new Map<string, Bar>();
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

export function getDataFeed({
  pairIndex,
  customPeriodParams,
  name = 'AAPL',
  token
}: any): IBasicDataFeed {
  let initialLoadComplete = false;
  return {
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
      const symbolInfo: LibrarySymbolInfo = {
        ticker: symbolName || name || '',
        name: symbolName || name || '',
        description: symbolName || name || '',
        type: "stock",
        // session: "24x7",
        // timezone: "Asia/Hong_Kong",
        session: "0930-1601",
        "timezone": "America/New_York",
        minmov: 1,
        pricescale: 100,  // 小数点后2位精度
        exchange: "RWA",
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
      try {
        const res = await klineApi.getCandles({ stock: token.stockId, interval: keyToMinutes(resolution as any || '15'), endTime: to, limit: countBack })
        const _data = res?.data || []
        if (res.code !== RESPONSE_CODE.SUCCESS || _data.length <= 0) {
          onHistoryCallback([], { noData: true });
          return;
        }
        let bars = _data.reverse().map((bar: any) => {
          return {
            "time": bar.t * 1000,
            "open": Number(truncate(bar.o, 2)),
            "high": Number(truncate(bar.h, 2)),
            "low": Number(truncate(bar.l, 2)),
            "close": Number(truncate(bar.c, 2)),
            "volume": bar.volume ?? 0,
          }
        })

        if (firstDataRequest) {
          lastBarsCache.set(symbolInfo.name, { ...bars[bars.length - 1] });
        }
        onHistoryCallback(bars, { noData: bars.length < countBack ? true : false });

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
      const sub = wsListeners.get(subscriberUID)
      if (sub) {
        wsService.off(sub.key, sub.listener)
        wsListeners.delete(subscriberUID)
      }
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
      
      
      const key = `candle.${symbolInfo.name}_${_resolution}`
      const listener = (data: any) => { 
        const lastBar = lastBarsCache.get(symbolInfo.name)
        if (data?.c > 0 && (!lastBar || lastBar.time < data.t)) {
          onRealtimeCallback({
            "time": data.t,
            "open": Number(truncate(data.o, 2)),
            "high": Number(truncate(data.h, 2)),
            "low": Number(truncate(data.l, 2)),
            "close": Number(truncate(data.c, 2)),
            "volume": 0,
          })
        }
      }
      wsListeners.set(subscriberUID, { key, listener })
      // @ts-ignore
      wsService.on(key, listener)
    },
    // @ts-ignore
    unsubscribeBars: (subscriberUID) => {
      
      const sub = wsListeners.get(subscriberUID)
      if (sub) {
        wsService.off(sub.key, sub.listener)
        wsListeners.delete(subscriberUID)
      }
    },
  };
}
