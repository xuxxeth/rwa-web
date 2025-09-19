import { memo, useEffect, useRef } from "react";
import { type ChartingLibraryWidgetOptions, type IChartingLibraryWidget, type ResolutionString } from "@/lib/charting_library/charting_library";
import { chartOverrides, disabledFeatures, enabledFeatures } from "@/config/constants";
import datafeed from "./datafeed";

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
      // @ts-ignore
      datafeed: datafeed,
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
      interval: "1M" as ResolutionString,
    };
    if (window.TradingView?.widget) {

      tvWidgetRef.current = new window.TradingView.widget(widgetOptions);
      tvWidgetRef.current?.onChartReady(function () {
          // const priceScale = tvWidgetRef.current?.activeChart().getPanes()[0].getMainSourcePriceScale();
          // priceScale?.setAutoScale(true)
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

export default memo(TVChartContainer)