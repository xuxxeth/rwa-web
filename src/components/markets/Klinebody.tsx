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
import { useRwaSummary } from "@/hooks/useRwaSummary"
import { useStockStore } from "@/stores/stockStore"
import { PreMarketOpen } from "./PreMarketOpen"
import IconWithTooltip from "../icon-tooltip"
import wsService from "@/service/webSocket/service"
import { truncate } from "@/utils/format"
import type { ISummaryDataItem } from "@/service/webSocket/types"

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
    const up = useMemo(() => Number(rwaPrice?.up), [rwaPrice?.up])
    const isPro = from === 'pro-trading'

    if (!rwaPrice) return null

    return (
      <div className={cn(
        " ",
        up === 0 ? 'text-[#A1A1A1]' : up > 0
              ? "text-[#25A750] text-[12px]"
              : "text-[#CA3F64] text-[12px]",
      )}>
        <div className={cn(
          "text-[20px] font-semibold leading-[100%]",
          isPro ? " text-[18px] " : ""
        )}>${rwaPrice.price || '--'}</div>
        <span
          className={cn(
            "leading-[100%] font-normal",
            isPro ? " text-[14px] " : ""
          )
            
            
          }
        >
          {up !== 0 && (up > 0 ? '+' : '-')}
          {Math.abs(Number(rwaPrice?.up || "0"))}%
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
    const [realtimeData, setRealtimeData] = useState<ISummaryDataItem | null>()

    const stockData = useStockStore(state => state.stockData)

    useEffect(() => {
      if (inputToken?.symbol) {
        // @ts-ignore
        wsService.on(`realtime.${inputToken.symbol}`, (rwa: ISummaryDataItem) => {
          const precision = inputToken?.precision
          const _data = {
            ...rwa,
            p: truncate(rwa.p || 0, precision), // 最新价
            o: truncate(rwa.o || 0, precision), // 今开价
            l: truncate(rwa.l || 0, precision), // 最低价
            h: truncate(rwa.h || 0, precision), // 最高价
            c: truncate(rwa.c || 0, precision), // 当日收盘价
            pc: truncate(rwa.pc || 0, precision), // 昨日收盘价
          } as any
          setRealtimeData(_data)
        })
      }
    }, [inputToken])

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
            <div className="mt-1">{stockData?.peTtm || '--'}</div>
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
                router.push('/markets/trading')
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