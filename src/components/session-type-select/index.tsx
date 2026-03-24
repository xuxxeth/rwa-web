

import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/v2/ui/select";
import { cn } from "@/lib/utils";
import { memo, useEffect, useMemo, useState } from "react";

import { useTradeStore } from "@/stores/tradeStore";
import { useTranslation } from "@/hooks/useTranslation";
import { SessionType, TradeType } from "@/hooks/useCaCommon";
import IconWithTooltip from "../icon-tooltip";
import { useBaseStore } from "@/stores/baseStore";
import { MARKET_STATUS } from "@/config/constants";
import { useTradingStartTime } from "@/hooks/useMarketState";

export type ISessionTypeItem = {
  code: string,
  label: string,
}

export type SessionTypeSelectProps = {
  value?: string;
  onChange?: (code: ISessionTypeItem) => void;
  className?: string
  label?: string
  orderValue?: string
  from?: string
}

const SessionTypeSelect = memo(
  ({
    value, 
    className,
    label,
    orderValue,
    from
  }: SessionTypeSelectProps) => {
    const { t } = useTranslation()
    const tradingTime = useTradingStartTime()
    const marketTradeState = useBaseStore(state => state.marketTradeState)
    const updateSessionType = useTradeStore(state => state.updateSessionType)
    const [typeItem, setTypeItem] = useState<{code: SessionType, label: string}>({code: SessionType.DEFAULT, label: t('v3.t16')})

    const sessionTypeList = useMemo(() => {
      return [
        {
          code: SessionType.PRE_MARKET_AND_AFTER_HOURS,
          label: t('v3.t17'),
          timeLabel: tradingTime ? `ET ${tradingTime.preOpenTime.H}:${tradingTime.preOpenTime.M} ~ ${tradingTime.openTime.H}:${tradingTime.openTime.M} + ET ${tradingTime.closeTime.H}:${tradingTime.closeTime.M} ~ ${tradingTime.afterCloseTime.H}:${tradingTime.afterCloseTime.M}` : '--:--'
        },
        {
          code: SessionType.DEFAULT,
          label: t('v3.t16'),
          timeLabel: tradingTime ? `ET ${tradingTime.openTime.H}:${tradingTime.openTime.M} ~  ${tradingTime.closeTime.H}:${tradingTime.closeTime.M}` : '--:--'
        }
      ]
    }, [t, tradingTime])

    const isOpenOrClose = marketTradeState === MARKET_STATUS.OPEN || marketTradeState === MARKET_STATUS.CLOSE

    useEffect(() => {
      // - 盘前/盘后时段，两个选项都支持选，默认为盘前+盘后（Extended Hour）
      // - 盘中/闭市时段，组件禁选，固定为盘中
      if (marketTradeState === MARKET_STATUS.CLOSE || marketTradeState === MARKET_STATUS.OPEN) {
        setTypeItem({
          code: SessionType.DEFAULT,
          label: t('v3.t16'),
        })
        updateSessionType(SessionType.DEFAULT)
      } else {
        setTypeItem({
          code: SessionType.PRE_MARKET_AND_AFTER_HOURS,
          label: t('v3.t17'),
        })
        updateSessionType(SessionType.PRE_MARKET_AND_AFTER_HOURS)
      }
    }, [marketTradeState, t])
    
    const [open, setOpen] = useState(false)

    return (
      <Select 
        value={String(typeItem.code)} 
        onOpenChange={open => {
          if (!isOpenOrClose) {
            setOpen(open)
          }
        }}
        onValueChange={(code) => {
          if (code) {
            const session = sessionTypeList.find(s => String(s.code) === code)
            if (session) {
              setTypeItem(session)
              updateSessionType(session.code)
            }
          }
          
        }}
      >
        <SelectTrigger 
          hideArrow={isOpenOrClose}
          open={open}
          className={cn(
            "px-3 py-0 h-[38px] shadow-none flex items-center justify-between rounded-[4px] cursor-pointer bg-[#1A1B1E] ",
            className,
            from === 'lite-trade' ? ' bg-[#1A1B1E]  ' : ' border border-solid border-[rgba(35,36,39,1)]',
            isOpenOrClose ? 'border-[#232427]' : 'border-[#1A1B1E]',
          )}
        >
          <div className={cn(
            "flex items-center gap-2 justify-between text-white font-normal text-[14px] w-full",
          )}>
            
            <IconWithTooltip tooltip={(
              <div className="">
                <div>
                  <span className=" font-semibold">{t('v3.t16') ?? ' '}：</span>
                  <span>{t('v3.t19')}</span>
                </div>
                <div className="mt-2">
                  <span className=" font-semibold">{t('v3.t17') ?? ' '}：</span>
                  <span> {t('v3.t20')}</span>
                </div>
              </div>
            )}>
              <div className="text-[#9DA3AF] border-b border-dashed border-[#9DA3AF] cursor-pointer text-[14px]">{t('v3.t18') ?? ' '}</div>
            </IconWithTooltip>
            <div className="">
              <span className={cn(
                "text-[#9DA3AF]",
              )}>{orderValue ?? ''}</span>
              <span className=" text-[#FFFFFF] ml-2 mr-[6px] text-[14px]">{typeItem.label ?? '--'}</span>
            </div>
            
          </div>
        </SelectTrigger>
        {
            !isOpenOrClose && (
              <SelectContent align="end" className=" border-[#41464F] bg-[#1A1B1E] px-0 min-w-[232px]">
                {sessionTypeList.map(session => (
                  <SelectItem key={session.code} value={String(session.code)} className="my-1">
                    <div className="w-full">
                      <div className="flex items-center justify-between w-full text-white text-[12px]">
                        <span>{session.label}</span>
                        <div className="w-11"></div>
                        <div className=" flex items-center">
                          <span className="text-[#9DA3AF] text-[12px]">{session.timeLabel}</span>
                          <div className="w-4 h-4 ml-2">
                            {
                              String(session.code) === String(typeItem.code) && (<img src="/images/v2/icons/selected.png" className="w-4 h-4" alt="" />)
                            }
                          </div>
                          
                        </div>
                      </div>
                      
                    </div>
                    
                  </SelectItem>
                ))}
              </SelectContent>
            )
        }
        
      </Select>
    )
  }
)

export { SessionTypeSelect }



