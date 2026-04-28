import { useTranslation } from "@/hooks/useTranslation"
import { memo, useEffect, useMemo, useRef, useState } from "react"

import { useTradeStore } from "@/stores/tradeStore"
import type { IRwa, IStatistic } from "@/service/base/types"
import { cn } from "@/lib/utils"
import { StockDialog } from "./StockDialog"
import { useStockStore } from "@/stores/stockStore"
import IconWithTooltip from "../icon-tooltip"
import {  calculateUp, formatLargeNumber, toFixed, truncate } from "@/utils/format"
import { useBaseStore } from "@/stores/baseStore"
import { divide, multiply, shortenAddress, subtract } from "@/utils"
import CopyButton from "../button/copyButton"

import { LazyImage } from "../image/LazyImage"
import { baseApi } from "@/service/base/api"
import { useClickOutside } from "@/hooks/useClickOutside"
import { MarketStatus } from "./MarketStatus"
import { useTailwindBreakpoints } from "@/hooks/useBreakpoints"

export const LabelWrap = memo(
  ({ children, tooltip }: { children: React.ReactNode, tooltip?: string | React.ReactNode }) => {
    if (!tooltip) return (
      <div className="text-[12px] w-full font-normal text-[#9DA3AF] cursor-pointer flex">
        <div className=" border-b border-dashed border-[#9DA3AF] whitespace-nowrap">
          {children}
        </div>
      </div>
    )
    return (
      <IconWithTooltip tooltip={tooltip}>
        <div className="text-[12px] w-full font-normal text-[#9DA3AF] cursor-pointer flex">
          <div className=" border-b border-dashed border-[#9DA3AF] whitespace-nowrap">
            {children}
          </div>
          
        </div>
      </IconWithTooltip>
    )
  }
)

const RwaItemPrice = memo(
  ({ is24H }: { is24H?: boolean}) => {
    const { t } = useTranslation()
    const realtimeData = useTradeStore(state => state.realtimeRwaData)
    const upValue = useMemo(() => realtimeData ? Number(truncate(subtract(realtimeData.p ?? '0', (realtimeData.o ?? '0')), 2)) : 0, [realtimeData?.o, realtimeData?.p])
    const openUp = useMemo(() => realtimeData ? Number(calculateUp(realtimeData.p, realtimeData.o)) : 0, [realtimeData?.o, realtimeData?.p])

    const priceWidth = useMemo(() => {
      if (!realtimeData?.p) return 70
      const length = String(realtimeData.p).length + 1
      return Math.max(70, length * 10 + 6)
    }, [realtimeData?.p])

    const upWidth = useMemo(() => {
      if (!realtimeData?.p || !realtimeData?.o) return 70
      const upStr = `${Math.abs(upValue).toFixed(2)}${Math.abs(openUp).toFixed(2)}`
      const length = upStr.length + 1
      return Math.max(70, length * 10)
    }, [realtimeData?.p, realtimeData?.o, upValue, openUp])

    return (
      <div className="min-w-[130px] shrink-0 flex items-center gap-x-5">
        <div className=" relative -top-[1px]">
          <div className="text-[12px] font-normal text-[#9DA3AF] flex">
            {t('portfolio.price')}
          </div>
          <div className={cn(
              "",
              openUp === 0 ? 'text-[#A1A1A1]' : openUp > 0
                    ? "text-[#25A750]"
                    : "text-[#CA3F64] ",
            )}
            style={{ width: priceWidth + 'px' }}
          >
            <div className={cn(
              "text-[18px] leading-[100%] font-semibold mt-1 min-w-[70px]",
            )}>
              {realtimeData?.p ? '$' + realtimeData?.p : '--'}
            </div>
          
          </div>
        </div>
        <div className="">
          <LabelWrap tooltip={t('v3.t381')}>{t('v3.t38')}</LabelWrap>
          <div className={cn(
              "",
              openUp === 0 ? 'text-[#A1A1A1]' : openUp > 0
                    ? "text-[#25A750]"
                    : "text-[#CA3F64] ",
            )}
            style={{ width: upWidth + 'px' }}
          >
            
            <div className="flex items-center gap-x-1 mt-[4px]">
              {
                (Number(realtimeData?.p) && Number(realtimeData?.o)) ? (
                  <span
                    className={cn(
                      "leading-[100%] font-normal text-[14px]",
                    )
                  }
                  >
                    {upValue !== 0 && (upValue > 0 ? '+' : '-')}
                    {Math.abs(Number(upValue || "0")).toFixed(2)}
                  </span>
                ) : <span
                    className={cn(
                      "leading-[100%] font-normal text-[14px] text-[#A1A1A1]",
                    )
                    }
                  >
                    --
                  </span>
              }
              {
                (Number(realtimeData?.p) && Number(realtimeData?.o)) ? (
                  <>
                    <span
                      className={cn(
                        "leading-[100%] font-normal text-[14px]",
                      )
                    }
                    >
                      ({openUp !== 0 && (openUp > 0 ? '+' : '-')}
                      {Math.abs(Number(openUp || "0")).toFixed(2)}%)
                    </span>
                   
                  </>
                
              ) : <span
                  className={cn(
                    "leading-[100%] font-normal text-[14px] text-[#A1A1A1]",
                  )
                  }
                >
                  (--)
                </span>
              }
            </div>
            
          
          </div>
        </div>
        
      </div>
      
      
    )
  }
)

export const StockInfo = memo(
  ({ from }: { from?: string }) => {
    const { t } = useTranslation()
    const { isLg, isXl } = useTailwindBreakpoints()
    const inputToken = useTradeStore(state => state.inputToken)
    const stockData = useStockStore(state => state.stockData)
    const realtimeData = useTradeStore(state => state.realtimeRwaData)
    const [showMore, setShowMore] = useState(false)
    const showMoreRef = useRef<HTMLDivElement>(null)

    const getMarket = useBaseStore(state => state.getMarket)

    useClickOutside(showMoreRef, () => {
      setShowMore(false)
    }, showMore)

    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          getMarket()
        }
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }, [])

    const setStockData = useStockStore(state => state.setStockData)
    const rwaPrice = useTradeStore(state => state.realtimeRwaData)
  
    const [statisticData, setStatisticData] = useState<IStatistic>()
    const unit = '1000000'
  
    const capData = useMemo(() => {
      let _data = {
        marketCap: '--',
        circCap: '--',
        peTtm: '--',
        peStatic: '--',
        pb: '--',
      }
      if (statisticData?.totalShare && rwaPrice?.p) {
        // 总市值 = 当前股价 * 总股本
        _data.marketCap = formatLargeNumber(multiply(statisticData.totalShare, rwaPrice.p))
        // 流通市值 = 当前股价 * 流通股本
        _data.circCap = formatLargeNumber(multiply(statisticData.circShare, rwaPrice.p))
        // _data.peTtm = formatLargeNumber(
        //   divide(multiply(statisticData.totalShare, rwaPrice.p), multiply(statisticData.netIncomeLtm, unit))
        // )
        _data.peTtm = toFixed(divide(rwaPrice.p, statisticData.epsTtm))
        // pe(static) = 总市值/ 上一个完整财年的净利润
        // _data.peStatic = formatLargeNumber(
        //   divide(multiply(statisticData.totalShare, rwaPrice.p), multiply(statisticData.netIncomeLastYear, unit))
        // )
        _data.peStatic = toFixed(divide(rwaPrice.p, statisticData.eps))
        // pb = 总市值/净资产
        _data.pb = formatLargeNumber(
          divide(multiply(statisticData.totalShare, rwaPrice.p), multiply(statisticData.netAsset, unit))
        )
      }
  
      return _data
    }, [statisticData, rwaPrice?.p])
  
    useEffect(() => {
      setStockData(capData)
    }, [capData])
  
    useEffect(() => {
      if (inputToken?.stockId ) {
        setStatisticData(undefined)
        baseApi.getStatistic(inputToken.stockId).then(res => {
          setStatisticData(res?.data || {})
        })
      }
    }, [inputToken?.stockId])

    const marketCapWidth = useMemo(() => {
      if (!stockData?.marketCap) return 30
      const marketCap = stockData.marketCap
      const length = String(marketCap).length - 1
      return Math.max(30, length * 10 - 6)
    }, [stockData?.marketCap, rwaPrice?.p])

    return (
      <div className="flex justify-between text-white px-4 min-w-[890px] rounded-r-[4px] bg-[#131416]">
        <div className="flex items-center gap-x-6">
          <StockDialog from={from} />
          <div className={cn(
            " flex items-center gap-x-6 text-white text-[14px] font-normal pr-4 relative",
          )}>
            
            <RwaItemPrice is24H={inputToken?.is24H} />

            <div className=" shrink-0">
              <LabelWrap tooltip={t('v2.tx.t201')}>{t('v2.tx.t45')}</LabelWrap>
              <div className="mt-1">{realtimeData?.h ? '$' + realtimeData?.h : '--'}</div>
            </div>
            <div className=" shrink-0">
              <LabelWrap tooltip={t('v2.tx.t211')}>{t('v2.tx.t46')}</LabelWrap>
              <div className="mt-1">{ realtimeData?.l ? '$' + realtimeData?.l : '--'}</div>
            </div>
            <div className=" shrink-0 hidden xl:block">
              <LabelWrap tooltip={t('v2.tx.t161')}>{t('v2.tx.t16')}</LabelWrap>
              <div className="mt-1" style={{width: marketCapWidth + 'px'}}>{stockData?.marketCap || '--'}</div>
            </div>
            <div className=" shrink-0 hidden xl:block">
              <LabelWrap tooltip={t('companyProfile.floatCapH')}>{t('companyProfile.floatCap')}</LabelWrap>
              <div className="mt-1">{stockData?.circCap || '--'}</div>
            </div>
            <div ref={showMoreRef} className=" shrink-0 flex items-center gap-x-4 relative">
              <div className=" hidden xl:block">
                <LabelWrap tooltip={t('v2.tx.t171')}>{t('v2.tx.t17')}</LabelWrap>
                <div className="mt-1">{stockData?.peTtm ? parseFloat(stockData.peTtm) < 0 ? t('v2.tx.t42') : stockData?.peTtm : '--'}</div>
              </div>
              <div className={cn(
                " cursor-pointer ",
                showMore ? "bg-[#282A2F]" : ""
              )}
                onClick={e => {
                  e.stopPropagation()
                  setShowMore(!showMore)
                }}
              >
                <LazyImage src="/images/v2/icons/double-down.png" className={cn(
                  "w-4",
                  showMore ? "rotate-180" : ""
                )} />
              </div>
              {
                showMore && (
                  <div className={cn(
                    " absolute z-50 top-[108%] right-0 bg-[#282A2F] rounded-[4px] p-4 gap-x-6",
                    !isXl ? "w-[440px] grid grid-cols-4 gap-y-4" : "flex items-center"
                  )}
                    style={{height: isXl ? 80 : 140}}
                  >
                      <div className=" shrink-0 xl:hidden">
                        <LabelWrap tooltip={t('v2.tx.t161')}>{t('v2.tx.t16')}</LabelWrap>
                        <div className="mt-2" style={{width: marketCapWidth + 'px'}}>{stockData?.marketCap || '--'}</div>
                      </div>
                      <div className=" shrink-0 xl:hidden">
                        <LabelWrap tooltip={t('companyProfile.floatCapH')}>{t('companyProfile.floatCap')}</LabelWrap>
                        <div className="mt-2">{stockData?.circCap || '--'}</div>
                      </div>
                      <div className=" shrink-0 xl:hidden">
                        <LabelWrap tooltip={t('v2.tx.t171')}>{t('v2.tx.t17')}</LabelWrap>
                        <div className="mt-2">{stockData?.peTtm ? parseFloat(stockData.peTtm) < 0 ? t('v2.tx.t42') : stockData?.peTtm : '--'}</div>
                      </div>
                    {[
                      {
                        title: 'tso',
                        value: statisticData?.totalShare ? formatLargeNumber(statisticData?.totalShare || '') : '--',
                        tooltip: 'tsoH',
                      },
                      {
                        title: 'float',
                        value: statisticData?.circShare ? formatLargeNumber(statisticData?.circShare || '') : '--',
                        tooltip: 'floatH',
                      },

                      {
                        title: 'pe',
                        // value: capData?.peStatic || '',
                        value: capData?.peStatic ? parseFloat(capData.peStatic) < 0 ? t('v2.tx.t42') : capData?.peStatic : '--',
                        tooltip: 'peH',
                      },
                      {
                        title: 'pb',
                        value: capData?.pb || '',
                        tooltip: 'pbH',
                      },
                    ].map(({ title, value, tooltip }) => {
                      return (
                        <div key={title} className='text-sm/4.5 font-normal'>
                          <IconWithTooltip
                            tooltip={t(`companyProfile.${tooltip}`)}
                            triggerClassName='inline-flex justify-start'
                          >
                            <div className='text-gray-400 border-b border-b-gray-400 border-dashed text-[12px] whitespace-nowrap'>
                              {t(`companyProfile.${title}`)}
                            </div>
                          </IconWithTooltip>
                          <div className='text-white mt-2'>{value}</div>
                        </div>
                      )
                    })}
                  </div>
                )
              }
            </div>
            
            
            <div className=" shrink-0">
              <div className="text-[12px] font-normal text-[#9DA3AF] flex">
                {t('v3.t30')}
              </div>
              <div className="flex items-center gap-x-1 mt-1">
                {shortenAddress(inputToken?.address || '')}
                <CopyButton copyText={inputToken?.address || ''} />
              </div>
            </div>

            
            
          </div>
        </div>
        
        <MarketStatus from="trade" />
        
      </div>
    )
  }
)

