import { SmallButton } from "@/components/button/SmallButton"
import { TradingChart } from "@/components/TVChart/TradingChart"
import { useTranslation } from "@/hooks/useTranslation"
import { memo, useEffect, useMemo, useState } from "react"
import { Statistics } from "./Statistics"
import { Profile } from "./Profile"
import { useTradeStore } from "@/stores/tradeStore"
import { useRwaPrice } from "@/hooks/useTokenBalances"
import type { IRwa } from "@/service/base/types"
import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/useRouter"
import { StockDialog } from "./StockDialog"
import { useStockStore } from "@/stores/stockStore"
import { PreMarketOpen } from "./PreMarketOpen"
import IconWithTooltip from "../icon-tooltip"
import { truncate } from "@/utils/format"
import type { ISummaryDataItem } from "@/service/webSocket/types"
import { useBaseStore } from "@/stores/baseStore"

export const LabelWrap = memo(
  ({ children, tooltip }: { children: React.ReactNode, tooltip?: string }) => {
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
  ({ data, from }: { data: IRwa, from?: string}) => {
    const rwaPrice = useRwaPrice(data.symbol)
    const realtimeData = useTradeStore(state => state.realtimeRwaData)

    // const up = useMemo(() => Number(rwaPrice?.up), [rwaPrice?.up])
    const up = useMemo(() => realtimeData ? Number(truncate((realtimeData?.pc && realtimeData?.p ? realtimeData.p / realtimeData.pc - 1 : 0) * 100, 2)) : 0 ,[realtimeData?.p])
    const isPro = from === 'pro-trading'

    if (!realtimeData) return null

    return (
      <div className={cn(
        " min-w-[60px]",
        up === 0 ? 'text-[#A1A1A1]' : up > 0
              ? "text-[#25A750] text-[12px]"
              : "text-[#CA3F64] text-[12px]",
      )}>
        <div className={cn(
          "text-[20px] leading-[100%] font-mono-semibold",
          isPro ? " text-[18px] " : ""
        )}>${realtimeData.p || '--'}</div>
        <span
          className={cn(
            "leading-[100%] font-normal font-mono",
            isPro ? " text-[14px] " : ""
          )
            
            
          }
        >
          {up !== 0 && (up > 0 ? '+' : '-')}
          {Math.abs(Number(up || "0"))}%
        </span>
      </div>
    )
  }
)

export const StockInfo = memo(
  ({ from }: { from?: string }) => {
    const { t } = useTranslation()
    const router = useRouter()
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
      <div className="flex justify-between text-white pl-4">
        <StockDialog from={from} />
        <div className={cn(
          " flex items-center gap-x-10 text-white text-[14px] font-normal pr-4",
        )}>
          
          {
            inputToken && <RwaItemPrice from={from} data={inputToken} />
          }
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
          <PreMarketOpen />
          {
            from !== 'pro-trading' && 
              <SmallButton onClick={() => {
                router.push('/trade')
              }} >{t('Enter Pro Trading')}</SmallButton>
          }
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