import type {
  Bar,
  LibrarySymbolInfo,
  IBasicDataFeed,
  DatafeedConfiguration,
  ResolutionString,
  PeriodParams,
} from "@/lib/charting_library/charting_library";

import chartTable from './chartTable2.json'

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


const getChartTable = (data: any) => {
  // @ts-ignore
  if (window.initBar && data.from !== 'getMarks') {
    return {
      table: []
    }
  }
  // @ts-ignore
  window.initBar = true
  return chartTable
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
    "45",
    "60",
    "240",
    "1440",
  ] as ResolutionString[],

};

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
        ticker: name,
        name: name,
        description: name,
        type: "stock",
        // session: "24x7",
        // timezone: "Asia/Hong_Kong",
        "session": "0400-2000",
        "timezone": "America/New_York",
        minmov: 1,
        pricescale: 1000000000,
        exchange: "",
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
      const data = await getChartTable({from: 'getMarks'});
      const marks = data.table
        .filter(d => tagSession(d) !== "regular") // 只标记盘前和盘后
        .map(d => ({
          id: d.time.toString(),
          time: d.time,
          color: tagSession(d) === "pre" ? "blue" : "purple",
          text: tagSession(d).toUpperCase()
        }));
      // @ts-ignore
      onDataCallback(marks);
    },
    getBars: async (
      symbolInfo,
      resolution,
      periodParams,
      onHistoryCallback,
      onErrorCallback
    ) => {
      console.log('get bar')      
      // Use customPeriodParams if needed
      const { from, to, firstDataRequest, countBack } = periodParams
      try {
        const chartTable: any = await getChartTable({
          token,
          pairIndex,
          from,
          to,
          range: +resolution,
          countBack
        });

        if (!chartTable || !chartTable.table) {
          onHistoryCallback([], { noData: true });
          return;
        }

        let bars = chartTable.table.map((bar: { time: number; }) => ({
          ...bar,
          time: bar.time * 1000, // Convert from seconds to milliseconds
        }));

        if (firstDataRequest) {
          lastBarsCache.set(symbolInfo.name, { ...bars[bars.length - 1] });
        }

        onHistoryCallback(bars, { noData: false });

        if (!initialLoadComplete) {
          initialLoadComplete = true;
        }
        return;
      } catch (error) {
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
      // subscribeOnStream(
      //   symbolInfo,
      //   resolution,
      //   onRealtimeCallback,
      //   subscriberUID,
      //   onResetCacheNeededCallback,
      //   lastBarsCache.get(symbolInfo.name)!,
      //   pairIndex,
      // );
    },
    // @ts-ignore
    unsubscribeBars: (subscriberUID) => {
      // unsubscribeFromStream(subscriberUID);
    },
  };
}
