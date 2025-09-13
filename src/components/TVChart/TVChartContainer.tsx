import { useEffect, useRef } from "react";
import { getDataFeed, tagSession } from "./datafeed";
import { type ChartingLibraryWidgetOptions, type IChartingLibraryWidget, type ResolutionString } from "@/lib/charting_library/charting_library";
import { chartOverrides, disabledFeatures, enabledFeatures } from "@/config/constants";
import chartTable from './chartTable2.json'
// @ts-ignore
function drawOverlay(chart, session, start, end, low, high) {
  chart.createMultipointShape(
    [
      { time: start, price: low },
      { time: end + 60, price: high }
    ],
    {
      shape: "rectangle",
      color: session === "pre" ? "rgba(0,0,255,0.9)" : "rgba(128,0,128,0.9)",
      disableSelection: true,
      disableSave: true
    }
  );
}

export const TVChartContainer = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLInputElement>;
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);
  
  useEffect(() => {
    if (!chartContainerRef.current) {
        return () => { };
    }
    if (tvWidgetRef.current) {
        tvWidgetRef.current.remove();
    }

    const elem = chartContainerRef.current;
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: 'Symbol',
      debug: false,
      datafeed: getDataFeed({}),
      theme: "dark",
      locale:"en",
      container: elem,
      library_path: `/libraries/charting_library/`,
      loading_screen: {
          backgroundColor: "#111114",
          foregroundColor: "#111114",
      },
      enabled_features: enabledFeatures,
      disabled_features: disabledFeatures,
      client_id: "tradingview.com",
      user_id: "public_user_id",
      fullscreen: false,
      autosize: true,
      // custom_css_url: "/tradingview-chart.css",
      timezone:"Asia/Hong_Kong",
      overrides: chartOverrides,
      interval: "1D" as ResolutionString,
      studies_overrides: {
        "volume.volume.color.0": "rgba(255, 0, 0, 0.5)",  // 下跌柱颜色
        "volume.volume.color.1": "rgba(0, 128, 0, 0.5)",  // 上涨柱颜色
        "volume.volume.transparency": 30,                 // 透明度
      }
    };
    if (window.TradingView?.widget) {
      tvWidgetRef.current = new window.TradingView.widget(widgetOptions);
      tvWidgetRef.current?.onChartReady(function () {
          // const priceScale = tvWidgetRef.current?.activeChart().getPanes()[0].getMainSourcePriceScale();
          // priceScale?.setAutoScale(true)

        const chart = tvWidgetRef.current?.activeChart();
        // 添加成交量指标
        chart?.createStudy("Volume", false, false);
        
        // // 用 overlay 高亮盘前/盘后
        // chartTable.table.forEach(d => {
        //   const session = tagSession(d);
        //   if (session !== "regular") {
        //     chart?.createMultipointShape(
        //       [
        //         { time: d.time, price: d.low },
        //         { time: d.time + 60, price: d.high }
        //       ],
        //       {
        //         shape: "rectangle",
        //         // @ts-ignore
        //         color: session === "pre" ? "rgba(0,0,255,0.1)" : "rgba(128,0,128,0.1)",
        //         disableSelection: true,
        //         disableSave: true
        //       }
        //     );
        //   }
        // });
        // ✅ 合并连续的盘前/盘后时间段并画 overlay
        let currentSession = null;
        let sessionStart = null;
        let sessionEnd = null;
        const mockData = chartTable.table
        for (let i = 0; i < mockData.length; i++) {
          const d = mockData[i];
          const session = tagSession(d);
          if (session !== "regular") {
            if (!currentSession) {
              // 开始新 session
              currentSession = session;
              sessionStart = d.time;
              sessionEnd = d.time;
            } else if (session === currentSession) {
              // 继续当前 session
              sessionEnd = d.time;
            } else {
              // session 变化，先画上一个
              drawOverlay(chart, currentSession, sessionStart, sessionEnd, d.low, d.high);
              // 开始新的 session
              currentSession = session;
              sessionStart = d.time;
              sessionEnd = d.time;
            }
          } else {
            // regular 出现，结束之前的 session
            if (currentSession) {
              drawOverlay(chart, currentSession, sessionStart, sessionEnd, d.low, d.high);
              currentSession = null;
            }
          }
        }
        // 收尾
        if (currentSession) {
          drawOverlay(chart, currentSession, sessionStart, sessionEnd, mockData[mockData.length - 1].low, mockData[mockData.length - 1].high);
        }

      });
    }
    

    return () => {
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove();
      }
    };
  }, []);

  return (
    <div className=" relative h-[600px] text-white">
      <div
        className="h-full"
        ref={chartContainerRef}
      >

      </div>
    </div>
  )
}

export default TVChartContainer