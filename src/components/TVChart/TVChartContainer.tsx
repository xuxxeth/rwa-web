import { memo, useCallback, useEffect, useRef } from "react";
import { getDataFeed, tagSession, type IExtaIBasicDataFeed } from "./datafeed";
import { type SeriesType, type ChartingLibraryWidgetOptions, type CreateStudyOptions, type EntityId, type IBasicDataFeed, type IChartingLibraryWidget, type IChartWidgetApi, type ResolutionString } from "@/lib/charting_library/charting_library";
import { CA_LANGUAGE, chartOverrides, disabledFeatures, enabledFeatures } from "@/config/constants";
import type { IRwa, IToken } from "@/service/base/types";
import { cn } from "@/lib/utils";
import storage from "@/utils/storage";
import { useTranslation } from "@/hooks/useTranslation";
import { SessionLineSelectt, type IItemCode } from "../session-line-select";

let initChart: any
let ma1Id: EntityId | null = null
let ma2Id: EntityId | null = null
let ma3Id: EntityId | null = null

let maIds: EntityId[] = [];

const addOrRemoveMA = async (chart: IChartWidgetApi, chartType: SeriesType) => {
  // 清理旧的
  maIds.forEach(id => chart.removeEntity(id));
  maIds = [];

  if (chartType === 1) {
    // MA5
    const ma1Id = await chart.createStudy("Moving Average", false, false, { length: 5 }, { "plot.color.0": "#429D45" });
    if (ma1Id) maIds.push(ma1Id)
    // MA10
    const ma2Id = await chart.createStudy("Moving Average", false, false, { length: 10 }, { "plot.color.0": "#FF6D01" })
    if (ma2Id) maIds.push(ma2Id)  
    // MA30
    const ma3Id = await chart.createStudy("Moving Average", false, false, { length: 30 }, { "plot.color.0": "rgba(0,128,0,0.5)" })
    if (ma3Id) maIds.push(ma3Id)   
  }
}

export const TVChartContainer = memo(
  ({ token, from }: { token: IRwa, from?: string}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLInputElement>;
    const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);
    const dataFeedRef = useRef<IExtaIBasicDataFeed | null>(null)
    const tvWidgetReady = useRef(false)
    const skipIntervalChangeRef = useRef(false)
    const { i18n } = useTranslation()
    
    useEffect(() => {
      let mounted = true;
      let initTimer: number | undefined;
      if (tvWidgetRef.current) {
          // tvWidgetRef.current.remove();
        return
      }

      initChart = (rwa?: IRwa) => {
        const elem = chartContainerRef.current;
        const language = storage.getItem(CA_LANGUAGE) || 'en'
        if (!mounted || !elem) {
          initTimer = window.setTimeout(initChart, 100);
          return;
        }
        if (!dataFeedRef.current) {
          dataFeedRef.current = getDataFeed({ name: rwa?.symbol || token.symbol, token: rwa || token })
        }
        const widgetOptions: ChartingLibraryWidgetOptions = {
          symbol: rwa?.symbol || token.symbol,
          debug: false,
          datafeed: dataFeedRef.current,
          theme: "dark",
          locale: language,
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
          custom_css_url: "/libraries/charting_library/tradingview-chart.css?_t=0.1.4",
          timezone:"Asia/Hong_Kong",
          overrides: chartOverrides,
          interval: "1" as ResolutionString,
          studies_overrides: {
            // "volume.volume.color.0": "rgba(255, 0, 0, 0.5)",  // 下跌柱颜色
            // "volume.volume.color.1": "rgba(0, 128, 0, 0.5)",  // 上涨柱颜色
            // "volume.volume.transparency": 30,   
          },
          "favorites": {
              "intervals": ["5", "15",] as ResolutionString[], // 默认收藏的时间周期
          },

        };
        if (window.TradingView?.widget) {
          tvWidgetRef.current = new window.TradingView.widget(widgetOptions);
          tvWidgetRef.current?.onChartReady(function () {
            tvWidgetReady.current = true
              // const priceScale = tvWidgetRef.current?.activeChart().getPanes()[0].getMainSourcePriceScale();
              // priceScale?.setAutoScale(true)
            // tvWidgetRef.current?.setDebugMode(true);
            tvWidgetRef.current?.applyOverrides({
              "paneProperties.background": "#131416",
              "paneProperties.backgroundType": "solid",
              "paneProperties.backgroundGradientStartColor": "#131416",
              "paneProperties.backgroundGradientEndColor": "#131416",
              "timeScale.rightOffset": 0,
              "timeScale.fixLeftEdge": true,
              "timeScale.fixRightEdge": true,
            });
            const chart = tvWidgetRef.current?.activeChart();
            if (chart) {
              chart.onDataLoaded().subscribe(null, () => {
                const timeScale = chart.getTimeScale();
                timeScale.setRightOffset(0);
                const resolution = (chart as any)?.resolution?.() || ("15" as ResolutionString)
                const range = dataFeedRef.current?.getBarsRange?.(undefined, resolution)
                if (range?.from && range?.to && range.from < range.to) {
                  chart.setVisibleRange(range, { percentRightMargin: 0 })
                }
              }, true);
              // 添加成交量指标，暂时不需要
              // chart?.createStudy("Volume", false, false).then((studyId) => {
              //   const panes = chart.getPanes();
              //   if (panes.length > 1) {
              //     // 默认第 0 个 pane 是主图，第 1 个就是 Volume
              //     const volumePane = panes[1];
              //     volumePane.setHeight(100); // 单位是像素，高度随你调
              //   }
              // });
              let currentChartType = chart.chartType();

              // chart.onChartTypeChanged().subscribe(null, (type) => {
              //   currentChartType = type;
                
              // });

              chart.onIntervalChanged().subscribe(null, (interval, obj) => {
                if (skipIntervalChangeRef.current) {
                  skipIntervalChangeRef.current = false
                  return
                }
                chart.setChartType(1);
                currentChartType = 1;
                dataFeedRef.current?.setCurrentType(1)
                addOrRemoveMA(chart, currentChartType)
                chart.resetData(); 
                
              });

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
              // chart.setChartType(3);
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

    // ✅ 当 token.symbol 变化时，切换 symbol，不销毁图表
    useEffect(() => {
      if (!tvWidgetRef.current || !token?.symbol || !tvWidgetReady.current) return

      const chart = tvWidgetRef.current.activeChart()
      if (!chart) return

      // 更新 datafeed 中的 token
      dataFeedRef.current?.setToken?.(token)

      const resolution = (chart as any)?.resolution?.() || ("15" as ResolutionString)
      chart.resetData?.()
      chart.setSymbol(token.symbol)
      chart.setResolution(resolution)
    }, [token?.symbol])

    // ✅ 当语言变化时，重新初始化图表
    useEffect(() => {
      if (tvWidgetRef.current && tvWidgetReady.current) {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
        dataFeedRef.current = null
        tvWidgetReady.current = false
        initChart && initChart(token)
      }
    }, [i18n.language])

    const handleSessionChange = useCallback((data: IItemCode) => {
      console.log(data)
      const chart = tvWidgetRef.current?.activeChart();
      if (chart) {
        addOrRemoveMA(chart, 3)
        chart.setChartType(3);
        dataFeedRef.current?.setCurrentType(3)
        dataFeedRef.current?.setSessionType(Number(data.code))
        skipIntervalChangeRef.current = true
        const resolution = ("1" as ResolutionString)
        chart.resetData?.()
        chart.setSymbol(String(Date.now()))
        chart.setResolution(resolution)
      }
      
    }, [token.symbol])

    return (
      <div className={cn(
        " relative text-white pr-4",
        from === 'market' ? "h-[500px]" : "h-[300px]"
      )}>
        <div className=" absolute w-4 h-1 -left-0 top-[38px] bg-[#1A1B1E] z-30">&nbsp;</div>
        <div className=" absolute w-4 h-1 -right-0 top-[38px] bg-[#1A1B1E] z-30">&nbsp;</div>
        <div className=" absolute left-4 top-[0px] h-[38px] flex items-center">
          <SessionLineSelectt onChange={handleSessionChange} />
        </div>
        <div
          className="h-full pl-4"
          ref={chartContainerRef}
        >

        </div>
      </div>
    )
  }
) 

export default TVChartContainer
