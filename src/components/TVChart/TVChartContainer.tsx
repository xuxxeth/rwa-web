import { useEffect, useRef } from "react";
import { getDataFeed, tagSession } from "./datafeed";
import { type ChartingLibraryWidgetOptions, type CreateStudyOptions, type IChartingLibraryWidget, type ResolutionString } from "@/lib/charting_library/charting_library";
import { chartOverrides, disabledFeatures, enabledFeatures } from "@/config/constants";

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
          chart?.createStudy("Volume", false, false).then((studyId) => {
            const panes = chart.getPanes();
            if (panes.length > 1) {
              // 默认第 0 个 pane 是主图，第 1 个就是 Volume
              const volumePane = panes[1];
              volumePane.setHeight(100); // 单位是像素，高度随你调
            }
          });
          
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
        // @ts-ignore
        window.initBar = true
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