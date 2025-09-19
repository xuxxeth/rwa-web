// utils/fetchAAPL.js
export async function fetchAAPL() {
  // @ts-ignore
  const apiToken = "68c0cc1ad9c4c8.14613388"; // 去 EODHD 或 StockData.org 申请
  const now = Math.floor(Date.now() / 1000);
   // @ts-ignore
  const fiveDaysAgo = now - 5 * 24 * 60 * 60;

  const url = `/libraries/aapl_mock2.json`;

  const res = await fetch(url);
  const raw = await res.json();

  const series = raw['Time Series (1min)']
  const seriesFilter = transformToTVBars(series)
  console.log(seriesFilter)


  return seriesFilter
  // 转换成 TradingView 需要的格式
  return raw.map((item: { time: any; open: any; high: any; low: any; close: any; }) => ({
    time: item.time,       // Unix 秒时间戳
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close
  }));
}

export function transformToTVBars(rawData: Record<string, any>) {
  return Object.entries(rawData)
    // 先把 key 转成 Date，然后按时间升序排序
    .map(([datetime, values]) => {
      const time = new Date(datetime).getTime(); // 毫秒时间戳
      return {
        time: Math.floor(time / 1000),
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        volume: parseFloat(values["5. volume"]),
      };
    })
    .sort((a, b) => a.time - b.time); // TradingView 需要升序
}
