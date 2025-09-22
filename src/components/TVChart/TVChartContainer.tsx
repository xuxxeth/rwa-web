import { useEffect, useRef } from "react";
import { getDataFeed, tagSession } from "./datafeed";
import { type ChartingLibraryWidgetOptions, type CreateStudyOptions, type IChartingLibraryWidget, type ResolutionString } from "@/lib/charting_library/charting_library";
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
        // "volume.volume.color.0": "rgba(255, 0, 0, 0.5)",  // 下跌柱颜色
        // "volume.volume.color.1": "rgba(0, 128, 0, 0.5)",  // 上涨柱颜色
        // "volume.volume.transparency": 30,       
        "paneProperties.background": "#0d0d0d",
        "paneProperties.vertGridProperties.color": "#222",
        "paneProperties.horzGridProperties.color": "#222",
        "scalesProperties.textColor": "#AAA",
        "mainSeriesProperties.candleStyle.upColor": "#26a69a",
        "mainSeriesProperties.candleStyle.downColor": "#ef5350",
        "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
        "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",          // 透明度
      },

    };
    if (window.TradingView?.widget) {
      tvWidgetRef.current = new window.TradingView.widget(widgetOptions);
      tvWidgetRef.current?.onChartReady(function () {
          // const priceScale = tvWidgetRef.current?.activeChart().getPanes()[0].getMainSourcePriceScale();
          // priceScale?.setAutoScale(true)

        const chart = tvWidgetRef.current?.activeChart();
        if (chart) {
          // 添加成交量指标
          chart?.createStudy("Volume", false, false);
          
          // MA5
          chart.createStudy("Moving Average", false, false, { length: 5 }, { "plot.color.0": "#429D45" })
            .then(id => {
              id && console.log(chart.getStudyById(id))
            });

          // MA10
          chart.createStudy("Moving Average", false, false, { length: 10 }, { "plot.color.0": "#FF6D01" });

          // MA30
          chart.createStudy("Moving Average", false, false, { length: 30 }, { "plot.color.0": "rgba(0,128,0,0.5)" });
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