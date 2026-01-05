import { fetchAAPL } from "@/utils/fetchAAPL";

const datafeed = {
  onReady: (cb: (arg0: { supported_resolutions: string[]; }) => void) => {
    setTimeout(() => cb({
      supported_resolutions: ["1", "5", "15", "30", "60", "D"]
    }), 0);
  },
  // @ts-ignore
  resolveSymbol: (symbolName: any, onSymbolResolvedCallback: (arg0: { name: string; ticker: string; type: string; session: string; timezone: string; minmov: number; pricescale: number; has_intraday: boolean; supported_resolutions: string[]; }) => void) => {
    setTimeout(() => onSymbolResolvedCallback({
      name: "AAPL",
      ticker: "AAPL",
      type: "stock",
      session: "0930-1600",
      timezone: "America/New_York",
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      supported_resolutions: ["1", "5", "15", "30", "60", "D"]
    }), 0);
  },
  // UFQ2HGN5Q2BQ7YL1
  // @ts-ignore
  getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
    try {
      const data = await fetchAAPL();
      onHistoryCallback(data, { noData: false });
    } catch (err) {
      onErrorCallback(err);
    }
  },
  // @ts-ignore
  subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
    console.log("Subscribed:", subscriberUID);
  },
  // @ts-ignore
  unsubscribeBars: (subscriberUID) => {
    console.log("Unsubscribed:", subscriberUID);
  }
};

export default datafeed
