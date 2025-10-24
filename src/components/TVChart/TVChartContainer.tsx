import { memo, useEffect, useRef } from "react";
import { getDataFeed, tagSession } from "./datafeed";
import { type ChartingLibraryWidgetOptions, type CreateStudyOptions, type IChartingLibraryWidget, type ResolutionString } from "@/lib/charting_library/charting_library";
import { chartOverrides, disabledFeatures, enabledFeatures } from "@/config/constants";
import type { IRwa, IToken } from "@/service/base/types";
import { cn } from "@/lib/utils";


export const TVChartContainer = memo(
  ({ token, from }: { token: IRwa, from?: string}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLInputElement>;
    const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);
    
    useEffect(() => {
      let mounted = true;
      let initTimer: number | undefined;
      if (tvWidgetRef.current) {
          // tvWidgetRef.current.remove();
        return
      }

      const initChart = () => {
        const elem = chartContainerRef.current;
        if (!mounted || !elem) {
          initTimer = window.setTimeout(initChart, 100);
          return;
        }
        const widgetOptions: ChartingLibraryWidgetOptions = {
          symbol: token.symbol,
          debug: false,
          datafeed: getDataFeed({ name: token.symbol, token }),
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
          custom_css_url: "/libraries/charting_library/tradingview-chart.css",
          timezone:"Asia/Hong_Kong",
          overrides: chartOverrides,
          interval: "1" as ResolutionString,
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
            // tvWidgetRef.current?.setDebugMode(true);
            tvWidgetRef.current?.applyOverrides({
              "paneProperties.background": "#06070A",
              "paneProperties.backgroundType": "solid",
              "paneProperties.backgroundGradientStartColor": "#06070A",
              "paneProperties.backgroundGradientEndColor": "#06070A",
            });
            const chart = tvWidgetRef.current?.activeChart();
            if (chart) {
              // 添加成交量指标，暂时不需要
              // chart?.createStudy("Volume", false, false).then((studyId) => {
              //   const panes = chart.getPanes();
              //   if (panes.length > 1) {
              //     // 默认第 0 个 pane 是主图，第 1 个就是 Volume
              //     const volumePane = panes[1];
              //     volumePane.setHeight(100); // 单位是像素，高度随你调
              //   }
              // });
              // tvWidgetRef.current?.activeChart().executeActionById("hideLeftToolbar");
              
              // MA5
              chart.createStudy("Moving Average", false, false, { length: 5 }, { "plot.color.0": "#429D45" })
                .then(id => {
                  
                });

              // MA10
              chart.createStudy("Moving Average", false, false, { length: 10 }, { "plot.color.0": "#FF6D01" });

              // MA30
              chart.createStudy("Moving Average", false, false, { length: 30 }, { "plot.color.0": "rgba(0,128,0,0.5)" });

              setTimeout(() => {
                const iframe = chartContainerRef.current.querySelector('iframe') as HTMLIFrameElement;
                const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
                const toggler = innerDoc?.querySelector('.toggler-l31H9iuA') as HTMLDivElement ;
                toggler?.click()
              }, 300)
              // 隐藏图例（防止出现 "MA5 close" 等）
              // const panes = chart.getPanes?.();
              // if (panes?.length) {
              //   panes[0].getStudies().forEach((s: any) => s.setVisible(true));
              // }
            }
            
          });
        }
      }
      
      initChart()

      return () => {
        mounted = false;
        if (initTimer) clearTimeout(initTimer);
        if (tvWidgetRef.current) {
          tvWidgetRef.current.remove();
          tvWidgetRef.current = null
          // @ts-ignore
          window.initBar = true
        }
      };
    }, []);

    return (
      <div className={cn(
        " relative text-white",
        from === 'market' ? "h-[600px]" : "h-[300px]"
      )}>
        <div
          className="h-full"
          ref={chartContainerRef}
        >

        </div>
      </div>
    )
  }
) 

export default TVChartContainer