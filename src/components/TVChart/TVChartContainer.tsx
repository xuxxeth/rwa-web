import { memo, useCallback, useEffect, useRef, useState } from "react";
import { getDataFeed, tagSession, type IExtaIBasicDataFeed } from "./datafeed";
import { type SeriesType, type ChartingLibraryWidgetOptions, type CreateStudyOptions, type EntityId, type IBasicDataFeed, type IChartingLibraryWidget, type IChartWidgetApi, type ResolutionString, type Timezone } from "@/lib/charting_library/charting_library";
import { CA_LANGUAGE, chartOverrides, disabledFeatures, enabledFeatures, MARKET_STATUS } from "@/config/constants";
import type { IRwa, IToken } from "@/service/base/types";
import { cn } from "@/lib/utils";
import storage from "@/utils/storage";
import { useTranslation } from "@/hooks/useTranslation";
import { SessionLineSelectt, type IItemCode } from "../session-line-select";
import { useBaseStore } from "@/stores/baseStore";
import { useTradingStartTime } from "@/hooks/useMarketState";
import { useNotSupportSession } from "@/hooks/useNotSupportSession";

let initChart: any

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
    const [tvWidgetShow, setTvWidgetShow] = useState(false)
    const tvWidgetReady = useRef(false)
    const skipIntervalChangeRef = useRef(false)
    const wasAreaModeRef = useRef(false)
    const tokenSymbolRef = useRef(token.symbol)
    const { i18n } = useTranslation()
    const [chartType, setChartType] = useState(true)
    const chartTypeRef = useRef(chartType)
    const marketStateRef = useRef(MARKET_STATUS.DEFAULT)
    const marketTradeState = useBaseStore(state => state.marketTradeState)
    const tradingTime = useTradingStartTime()
    const { notSupportBeforeOrAfter, notSupportOvernight } = useNotSupportSession(marketTradeState, token)

    const syncAreaModeClass = useCallback((enabled: boolean) => {
      console.log('syncAreaModeClass', enabled)
      const iframe = chartContainerRef.current?.querySelector('iframe') as HTMLIFrameElement | null
      const body = iframe?.contentDocument?.body || iframe?.contentWindow?.document?.body
      if (!body) return

      body.classList.toggle('tv-area-mode', enabled)
    }, [])

    const switchToCandle = useCallback((interval: ResolutionString = "1" as ResolutionString) => {
      const chart = tvWidgetRef.current?.activeChart()
      if (!chart || !tvWidgetRef.current) return

      setChartType(false)
      dataFeedRef.current?.setCurrentType(1)
      chart.setChartType(1)
      tvWidgetRef.current?.setSymbol(tokenSymbolRef.current, interval, () => {

      })

      // const applyCandle = () => {
      //   addOrRemoveMA(chart, 1)
      //   wasAreaModeRef.current = false
      //   ;(tvWidgetRef.current as any)?.resetCache?.()
      //   chart.resetData()
      // }

      // const emptySymbol = `__empty__${Date.now()}`
      // tvWidgetRef.current.setSymbol(emptySymbol, interval, () => {
      //   const targetSymbol = `__${tokenSymbolRef.current}__${Date.now()}`
      //   tvWidgetRef.current?.setSymbol(targetSymbol, interval, () => {
      //     applyCandle()
      //   })
      // })
    }, [])

    useEffect(() => {
      tokenSymbolRef.current = token.symbol
    }, [token.symbol])

    useEffect(() => {
      chartTypeRef.current = chartType
    }, [chartType])
    
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
        const systemTimezone = (Intl.DateTimeFormat().resolvedOptions().timeZone || "exchange") as Timezone
        const widgetOptions: ChartingLibraryWidgetOptions = {
          symbol: rwa?.symbol || token.symbol,
          debug: false,
          datafeed: dataFeedRef.current,
          theme: "dark",
          locale: language === 'zh' ? 'zh_TW' : language,
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
          custom_css_url: "/libraries/charting_library/tradingview-chart.css?_t=0.1.8",
          timezone: "exchange",
          overrides: chartOverrides,
          interval: "1" as ResolutionString,
          studies_overrides: {
            // "volume.volume.color.0": "rgba(255, 0, 0, 0.5)",  // 下跌柱颜色
            // "volume.volume.color.1": "rgba(0, 128, 0, 0.5)",  // 上涨柱颜色
            // "volume.volume.transparency": 30,   
          },
          "favorites": {
              "intervals": ["1", "5", "15",] as ResolutionString[], // 默认收藏的时间周期
          },

        };
        if (window.TradingView?.widget) {
          tvWidgetRef.current = new window.TradingView.widget(widgetOptions);
          tvWidgetRef.current?.onChartReady(function () {
            setTvWidgetShow(true)
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
              // chart.onDataLoaded().subscribe(null, () => {
              //   let currentChartType = chart.chartType();
              //   if (currentChartType === 3) {
              //     const timeScale = chart.getTimeScale();
              //     timeScale.setRightOffset(0);
              //     const resolution = (chart as any)?.resolution?.() || ("15" as ResolutionString)
              //     const range = dataFeedRef.current?.getBarsRange?.(undefined, resolution)
              //     if (range?.from && range?.to && range.from < range.to) {
              //       chart.setVisibleRange(range, { percentRightMargin: 0 })
              //     }
              //   }
              // }, true);
              // 添加成交量指标，暂时不需要
              // chart?.createStudy("Volume", false, false).then((studyId) => {
              //   const panes = chart.getPanes();
              //   if (panes.length > 1) {
              //     // 默认第 0 个 pane 是主图，第 1 个就是 Volume
              //     const volumePane = panes[1];
              //     volumePane.setHeight(100); // 单位是像素，高度随你调
              //   }
              // });
              

              // chart.onChartTypeChanged().subscribe(null, (type) => {
              //   currentChartType = type;
                
              // });

              chart.onChartTypeChanged().subscribe(
                  null,
                  (chartType) => {
                    if (chartType === 3) {

                    }
                  }
              );
              chart.onIntervalChanged().subscribe(null, (interval, obj) => {
                if (skipIntervalChangeRef.current) {
                  skipIntervalChangeRef.current = false
                  return
                }
                // barSpacing默认是6，如果小于6，则重置
                if (chart.getTimeScale().barSpacing() < 6) {
                  chart.getTimeScale().setBarSpacing(6)
                }
                // X时间轴移到最右侧
                chart.getTimeScale().setRightOffset(0)
                 
                if (chartTypeRef.current ) {
                  switchToCandle(interval as ResolutionString)
                }
                
              });

              syncAreaModeClass(chartTypeRef.current)
              dataFeedRef.current?.setMarketState(marketStateRef.current)
              setTimeout(() => {
                const iframe = chartContainerRef.current?.querySelector('iframe') as HTMLIFrameElement;
                const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
                const toggler = innerDoc?.querySelector('.toggler-l31H9iuA') as HTMLDivElement ;
                toggler?.click()

                // if (iframe) {
                //   const handle = () => {
                //     console.log("iframe ready ✅");

                //     const doc = iframe.contentDocument;
                //     if (!doc) return;

                //     const observer = new MutationObserver((mutations) => {
                //       for (const m of mutations) {
                //         console.log(m.addedNodes)
                //         m.addedNodes.forEach((node) => {
                //           if (!(node instanceof HTMLElement)) return;

                //           const isTooltip =
                //             node.getAttribute("role") === "tooltip" ||
                //             node.className?.toString().includes("tooltip");

                //           if (isTooltip) {
                //             node.remove();
                //           }
                //         });
                //       }
                //     });

                //     observer.observe(doc.body, {
                //       childList: true,
                //       subtree: true,
                //     });
                //   };

                //   // ✅ 情况1：已经加载完
                //   if (iframe.contentDocument?.readyState === "complete") {
                //     handle();
                //   } else {
                //     // ✅ 情况2：还没加载
                //     iframe.addEventListener("load", handle);
                //   }
                // }

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
    // @ts-ignore
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    // ✅ 当 token.symbol 变化时，切换 symbol，不销毁图表
    useEffect(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        if (!tvWidgetRef.current || !token?.symbol || !tvWidgetReady.current) return

        const chart = tvWidgetRef.current.activeChart()
        if (!chart) return

        dataFeedRef.current?.setToken?.(token)

        const _sessionType = dataFeedRef.current?.getSessionType() || 0

        const notSupportRealtime =
          (_sessionType === 1 || _sessionType === 3) && notSupportBeforeOrAfter.notSupport ||
          (_sessionType === 5 && notSupportOvernight.notSupport)

        dataFeedRef.current?.setSessionType(_sessionType, notSupportRealtime)
        
        const resolution =
          (chart as any)?.resolution?.() || ("15" as ResolutionString)

        // barSpacing默认是6，如果小于6，则重置
        if (chart.getTimeScale().barSpacing() < 6) {
          chart.getTimeScale().setBarSpacing(6)
        }
        // X时间轴移到最右侧
        chart.getTimeScale().setRightOffset(0)  
        chart.setSymbol(token.symbol)
        chart.setResolution(resolution)

        // dataFeedRef.current?.resetCache()
        // chart.resetData?.()
        
        
        
      }, 100) // 可以改成 50~100ms

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }, [token?.symbol, notSupportBeforeOrAfter.notSupport, notSupportOvernight.notSupport])

    // ✅ 当语言变化时，重新初始化图表
    useEffect(() => {
      if (tvWidgetRef.current && tvWidgetReady.current) {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
        dataFeedRef.current = null
        tvWidgetReady.current = false
        chartTypeRef.current = true
        setChartType(true)
        initChart && initChart(token)
        
      }
    }, [i18n.language])

    useEffect(() => {
      if (!tvWidgetReady.current) return
      syncAreaModeClass(chartType)
    }, [chartType, syncAreaModeClass])

    // 监听市场状态变化，更新dataFeed的市场状态
    useEffect(() => {
      dataFeedRef.current?.setMarketState(marketTradeState)
      marketStateRef.current = marketTradeState
    }, [marketTradeState])

    // 更新市场时间
    useEffect(() => {
      dataFeedRef.current?.setTradingStartTime(tradingTime?.tradingEndTime || 0)
    }, [tradingTime?.tradingEndTime])

    const handleSessionChange = useCallback((data: IItemCode) => {
      const chart = tvWidgetRef.current?.activeChart();
      if (chart) {


        setChartType(true)
        wasAreaModeRef.current = true
        addOrRemoveMA(chart, 3)
        chart.setChartType(3);
        dataFeedRef.current?.setCurrentType(3)
        const _sessionType = Number(data.code)
        const notSupportRealtime = (_sessionType === 1 || _sessionType === 3) && notSupportBeforeOrAfter.notSupport || _sessionType === 5 && notSupportOvernight.notSupport
        dataFeedRef.current?.setSessionType(Number(data.code), notSupportRealtime)
        skipIntervalChangeRef.current = true
        queueMicrotask(() => {
          skipIntervalChangeRef.current = false
        })
        const resolution = ("1" as ResolutionString)
        // const emptySymbol = `__empty__${Date.now()}`
        // tvWidgetRef.current?.setSymbol(emptySymbol, resolution, () => {
          
        // })
        chart.setResolution(resolution)
        if (data.code !== '0') {
          const targetSymbol = `__${tokenSymbolRef.current}__area`
          chart.setSymbol(targetSymbol)
        }
        // barSpacing默认是6，如果小于6，则重置
        if (chart.getTimeScale().barSpacing() < 6) {
          chart.getTimeScale().setBarSpacing(6)
        }
        // X时间轴移到最右侧
        chart.getTimeScale().setRightOffset(0)
        dataFeedRef.current?.resetCache()
        chart.resetData();
        
      }
      
    }, [token.symbol, notSupportBeforeOrAfter.notSupport, notSupportOvernight.notSupport])

    return (
      <div className={cn(
        " relative text-white pr-4 rounded-r-[4px] bg-[#131416]",
        from === 'market' ? "h-[500px]" : "h-[300px]"
      )}>
        <div className=" absolute w-4 h-1 -left-0 top-[38px] bg-[#1A1B1E] z-30">&nbsp;</div>
        <div className=" absolute w-4 h-1 -right-0 top-[38px] bg-[#1A1B1E] z-30">&nbsp;</div>
        {
          tvWidgetShow && (
            <div className=" absolute left-4 top-[0px] h-[38px] flex items-center">
              <SessionLineSelectt onChange={handleSessionChange} selected={chartType} />
              {
                chartType && (
                  <button
                    type="button"
                    className="h-[32px] w-[42px] bg-[rgba(0,0,0,0)]"
                    onClick={() => switchToCandle("1" as ResolutionString)}
                  />
                )
              }
              
            </div>
          )
        }
        
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
