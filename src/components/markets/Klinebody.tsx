import { SmallButton } from "@/components/button/SmallButton"
import { TradingChart } from "@/components/TVChart/TradingChart"
import { useTranslation } from "@/hooks/useTranslation"
import { memo, use, useEffect, useMemo, useState } from "react"
import { Statistics } from "./Statistics"
import { Profile } from "./Profile"
import { useTradeStore } from "@/stores/tradeStore"
import type { IRwa } from "@/service/base/types"
import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/useRouter"
import { StockDialog } from "./StockDialog"
import { useStockStore } from "@/stores/stockStore"
import IconWithTooltip from "../icon-tooltip"
import { toFixed, truncate } from "@/utils/format"
import { useBaseStore } from "@/stores/baseStore"
import { shortenAddress } from "@/utils"
import CopyButton from "../button/copyButton"
import { useTradingStartTime } from "@/hooks/useMarketState"
import { MARKET_STATUS } from "@/config/constants"
import { useCurrentTime } from "@/hooks/useCurrentTime"

export const LabelWrap = memo(
  ({ children, tooltip }: { children: React.ReactNode, tooltip?: string | React.ReactNode }) => {
    if (!tooltip) return (
      <div className="text-[12px] w-full font-normal text-[#9DA3AF] border-b border-dashed border-[#9DA3AF] cursor-pointer">
        {children}
      </div>
    )
    return (
      <IconWithTooltip tooltip={tooltip}>
        <div className="text-[12px] w-full font-normal text-[#9DA3AF] border-b border-dashed border-[#9DA3AF] cursor-pointer">
          {children}
        </div>
      </IconWithTooltip>
    )
  }
)

const RwaItemPrice = memo(
  ({ from }: { from?: string}) => {
    const { t } = useTranslation()
    const realtimeData = useTradeStore(state => state.realtimeRwaData)
    const tradingTime = useTradingStartTime()
    
    const pup = useMemo(() => realtimeData ? Number(toFixed((realtimeData?.c && realtimeData?.pc ? (realtimeData.c - realtimeData.pc) / realtimeData.pc : 0) * 100, 2)) : 0 ,[realtimeData?.c, realtimeData?.pc])
    const nup = useMemo(() => realtimeData ? Number(toFixed((realtimeData?.pc && realtimeData?.p ? (realtimeData.p - realtimeData.pc) / realtimeData.pc : 0) * 100, 2)) : 0 ,[realtimeData?.pc, realtimeData?.p])
    const openUp = useMemo(() => {
      return tradingTime?.tradeState === MARKET_STATUS.OPEN ? nup : pup
    }, [tradingTime?.tradeState, pup, nup])

    const currentTime = useCurrentTime()

    const [stateLabel1, setStateLabel1] = useState('')
    const [stateLabel2, setStateLabel2] = useState('')
    const [timeLabel1, setTimeLabel1] = useState('')
    const [timeLabel2, setTimeLabel2] = useState('')

    useEffect(() => {
      if (tradingTime) {
        if (tradingTime.tradeState === MARKET_STATUS.BEFORE) {
          setStateLabel1(t("v3.t21"))
          setStateLabel2(t("v3.t23"))
          setTimeLabel1(tradingTime.preCloseTime.label)
          setTimeLabel2('')
        } else if (tradingTime.tradeState === MARKET_STATUS.OPEN) {
          setStateLabel1(t("v3.t24"))
          setStateLabel2('')
          setTimeLabel1('')
          setTimeLabel2('')
        } else if (tradingTime.tradeState === MARKET_STATUS.AFTER) {
          setStateLabel1(t("v3.t21"))
          setStateLabel2(t("v3.t25"))
          setTimeLabel1(tradingTime.closeTime.label)
          setTimeLabel2('')
        } else {
          setStateLabel1(t("v3.t21"))
          setStateLabel2(t("v3.t22"))
          setTimeLabel1(tradingTime.closeTime.label)
          setTimeLabel2(tradingTime.afterCloseTime.label)
        }
      }
    }, [
      t,
      tradingTime
    ])

    if (!realtimeData) return <div className="min-w-[126px]"></div>

    return (
      <div className=" flex items-center gap-x-5 min-w-[126px] shrink-0">
        
        <div className=" shrink-0">
          <div className="text-[12px] font-normal text-[#9DA3AF]">{stateLabel1} ET {!timeLabel1 ? currentTime.label : timeLabel1}</div>
          <div className={cn(
            "flex items-baseline gap-x-1",
            openUp === 0 ? 'text-[#A1A1A1]' : openUp > 0
                  ? "text-[#25A750]"
                  : "text-[#CA3F64] ",
          )}>
            <div className={cn(
              "text-[18px] leading-[100%] font-semibold mt-1 min-w-[70px]",
            )}>${realtimeData.c || '--'}</div>
            <span
              className={cn(
                "leading-[100%] font-normal text-[14px]",
              )
              }
            >
              {openUp !== 0 && (openUp > 0 ? '+' : '-')}
              {Math.abs(Number(openUp || "0")).toFixed(2)}%
            </span>
          </div>
        </div>
        {
          tradingTime?.tradeState !== MARKET_STATUS.OPEN && (
            <div className=" shrink-0 min-w-[110px]">
              <div className="text-[12px] font-normal text-[#9DA3AF]">{stateLabel2} ET {timeLabel2 || currentTime.label}</div>
              <div className={cn(
                " flex items-baseline gap-x-1 text-[14px] text-white mt-[3px]"
              )}>
                <div className={cn(
                  "",
                  
                )}>${realtimeData.p || '--'}</div>
                <span
                  className={cn(
                    "",
                  )
                  }
                >
                  {nup !== 0 && (nup > 0 ? '+' : '-')}
                  {Math.abs(Number(nup || "0")).toFixed(2)}%
                </span>
              </div>
            </div>
          )
        }
        
      </div>
      
      
    )
  }
)

export const StockInfo = memo(
  ({ from }: { from?: string }) => {
    const { t } = useTranslation()
    const inputToken = useTradeStore(state => state.inputToken)
    const stockData = useStockStore(state => state.stockData)
    const realtimeData = useTradeStore(state => state.realtimeRwaData)

    const getMarket = useBaseStore(state => state.getMarket)

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

    return (
      <div className="flex text-white pl-4">
        <StockDialog from={from} />
        <div className={cn(
          " flex items-center gap-x-10 text-white text-[14px] font-normal pr-4 ml-10",
        )}>
          
          <RwaItemPrice from={from} />
          <div className=" shrink-0">
            <LabelWrap tooltip={t('v2.tx.t161')}>{t('v2.tx.t16')}</LabelWrap>
            <div className="mt-1">{stockData?.marketCap || '--'}</div>
          </div>
          <div className=" shrink-0">
            <LabelWrap tooltip={t('v2.tx.t171')}>{t('v2.tx.t17')}</LabelWrap>
            <div className="mt-1">{stockData?.peTtm ? parseFloat(stockData.peTtm) < 0 ? t('v2.tx.t42') : stockData?.peTtm : '--'}</div>
          </div>
          {/* <div className=" shrink-0">
            <LabelWrap tooltip={t('v2.tx.t181')}>{t('v2.tx.t18')}</LabelWrap>
            <div className="mt-1">{stockData?.peStatic || '--'}</div>
          </div> */}
          <div className=" shrink-0">
            <LabelWrap tooltip={t('v2.tx.t181')}>{t('v2.tx.t18')}</LabelWrap>
            <div className="mt-1">${realtimeData?.o || '--'}</div>
          </div>
          <div className=" shrink-0">
            <LabelWrap tooltip={t('v2.tx.t191')}>{t('v2.tx.t19')}</LabelWrap>
            <div className="mt-1">${realtimeData?.pc || '--'}</div>
          </div>
          <div className=" shrink-0">
            <LabelWrap tooltip={t('v2.tx.t201')}>{t('v2.tx.t20')}</LabelWrap>
            <div className="mt-1">${realtimeData?.h || '--'}</div>
          </div>
          <div className=" shrink-0">
            <LabelWrap tooltip={t('v2.tx.t211')}>{t('v2.tx.t21')}</LabelWrap>
            <div className="mt-1">${realtimeData?.l || '--'}</div>
          </div>
          <div className=" shrink-0">
            <LabelWrap tooltip={t('v2.tx.t211')}>{'合约地址'}</LabelWrap>
            <div className="flex items-center gap-x-1 mt-1">
              {shortenAddress(inputToken?.address || '')}
              <CopyButton copyText={inputToken?.address || ''} />
            </div>
          </div>
        </div>
        
        
      </div>
    )
  }
)



const KlineBody = memo(
  () => {
    return (
      <div className="bg-[#131416]">
        <StockInfo />
        <div className="mt-4">
          <TradingChart />
        </div>
        <Statistics />
        <Profile />
      </div>
    )
  }
)

export { KlineBody }