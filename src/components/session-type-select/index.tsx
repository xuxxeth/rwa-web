

import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/v2/ui/select";
import { cn } from "@/lib/utils";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import { useTradeStore } from "@/stores/tradeStore";
import { useTranslation } from "@/hooks/useTranslation";
import { SessionType, TradeType } from "@/hooks/useCaCommon";
import IconWithTooltip from "../icon-tooltip";
import { useBaseStore } from "@/stores/baseStore";
import { MARKET_STATUS } from "@/config/constants";
import { useTradingStartTime } from "@/hooks/useMarketState";
import { useSupportRegular } from "@/hooks/useSupportRegular";
import { useNotSupportSession } from "@/hooks/useNotSupportSession";

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
    const { isSupportRegular } = useSupportRegular()
    const tradeType = useTradeStore((state) => state.tradeType);
    const inputToken = useTradeStore(state => state.inputToken)
    const tradingTime = useTradingStartTime()
    const marketTradeState = useBaseStore(state => state.marketTradeState)
    const updateSessionType = useTradeStore(state => state.updateSessionType)
    const [typeItem, setTypeItem] = useState<{code: SessionType, label: string}>({code: SessionType.DEFAULT, label: t('v3.t16')})

    const isRegular = useMemo(() => {
      return isSupportRegular(inputToken?.symbol || '') && (tradingTime?.tradeState === MARKET_STATUS.BEFORE || tradingTime?.tradeState === MARKET_STATUS.AFTER || tradingTime?.tradeState === MARKET_STATUS.OVERNIGHT)
    }, [inputToken, tradingTime])

    const { notSupportBeforeOrAfter, notSupportOvernight } = useNotSupportSession(marketTradeState, inputToken)

    const sessionTypeList = useMemo(() => {
      return [
        {
          code: SessionType.PRE_MARKET_AND_AFTER_HOURS,
          label: t('v3.t17'),
          timeLabel: tradingTime ? `${t('v3.t31')} ${tradingTime.preOpenTime.H}:${tradingTime.preOpenTime.M} ~ ${tradingTime.openTime.H}:${tradingTime.openTime.M} + ${t('v3.t31')} ${tradingTime.closeTime.H}:${tradingTime.closeTime.M} ~ ${tradingTime.afterCloseTime.H}:${tradingTime.afterCloseTime.M}` : '--:--',
          timeLabelLocal: tradingTime ? `${tradingTime.preOpenTimeLocal.H}:${tradingTime.preOpenTimeLocal.M} ~ ${tradingTime.openTimeLocal.H}:${tradingTime.openTimeLocal.M} + ${tradingTime.closeTimeLocal.H}:${tradingTime.closeTimeLocal.M} ~ ${tradingTime.afterCloseTimeLocal.H}:${tradingTime.afterCloseTimeLocal.M}` : '--:--',
          disabled: isRegular || tradingTime?.tradeState === MARKET_STATUS.OVERNIGHT || tradingTime?.tradeState === MARKET_STATUS.OPEN || tradingTime?.tradeState === MARKET_STATUS.CLOSE || notSupportBeforeOrAfter.notSupport, // 盘前盘后时间段，在夜盘、盘中和闭市状态下不可选
        },
        {
          code: SessionType.DEFAULT,
          label: t('v3.t16'),
          timeLabel: tradingTime ? `${t('v3.t31')} ${tradingTime.openTime.H}:${tradingTime.openTime.M} ~ ${tradingTime.closeTime.H}:${tradingTime.closeTime.M}` : '--:--',
          timeLabelLocal: tradingTime ? `${tradingTime.openTimeLocal.H}:${tradingTime.openTimeLocal.M} ~ ${tradingTime.closeTimeLocal.H}:${tradingTime.closeTimeLocal.M}` : '--:--'
        },
        {
          code: SessionType.OVERNIGHT,
          label: t('v3.t171'),
          timeLabel: tradingTime ? `${t('v3.t31')} ${tradingTime.nightTradingStartTime.H}:${tradingTime.nightTradingStartTime.M} ~ ${tradingTime.nightTradingEndTime.H}:${tradingTime.nightTradingEndTime.M}` : '--:--',
          timeLabelLocal: tradingTime ? `${tradingTime.nightTradingStartTimeLocal.H}:${tradingTime.nightTradingStartTimeLocal.M} ~ ${tradingTime.nightTradingEndTimeLocal.H}:${tradingTime.nightTradingEndTimeLocal.M}` : '--:--',
          // 夜盘时间段，仅在夜盘状态下可选
          disabled: tradingTime?.tradeState !== MARKET_STATUS.OVERNIGHT || notSupportOvernight.notSupport
        }
      ]
    }, [t, tradingTime, isRegular, notSupportBeforeOrAfter.notSupport, notSupportOvernight.notSupport])

    useEffect(() => {
      // 盘前盘后，只支持盘中交易的股票，在盘前盘后和夜盘状态，默认显示盘中
      if (isRegular) {
        setTypeItem({
          code: SessionType.DEFAULT,
          label: t('v3.t16'),
        })
        updateSessionType(SessionType.DEFAULT)
      }
      // 闭闹和盘中
      else if (marketTradeState === MARKET_STATUS.CLOSE || marketTradeState === MARKET_STATUS.OPEN) {
        setTypeItem({
          code: SessionType.DEFAULT,
          label: t('v3.t16'),
        })
        updateSessionType(SessionType.DEFAULT)
      }
      // 夜盘
      else if (marketTradeState === MARKET_STATUS.OVERNIGHT) {
        // 如果当前是夜盘时间，但不支持夜盘交易，则默认选中仅盘中
        if (notSupportOvernight.notSupport) {
          setTypeItem({
            code: SessionType.DEFAULT,
            label: t('v3.t16'),
          })
          updateSessionType(SessionType.DEFAULT)
        } else {
            setTypeItem({
            code: SessionType.OVERNIGHT,
            label: t('v3.t171'),
          })
          updateSessionType(SessionType.OVERNIGHT)
        }
        
      } else {
        // 如果不支持盘前或盘后单，则默认选中仅盘中
        if (notSupportBeforeOrAfter.notSupport) {
          setTypeItem({
            code: SessionType.DEFAULT,
            label: t('v3.t16'),
          })
          updateSessionType(SessionType.DEFAULT)
        }  else {
          // 其他情况默认选中盘前盘后 
          setTypeItem({
            code: SessionType.PRE_MARKET_AND_AFTER_HOURS,
            label: t('v3.t17'),
          })
          updateSessionType(SessionType.PRE_MARKET_AND_AFTER_HOURS)
        }
      }
    }, [marketTradeState, isRegular, t, notSupportBeforeOrAfter.notSupport, notSupportOvernight.notSupport, updateSessionType])
    const preTradeType = useRef<TradeType | null>(null)
    useEffect(() => {
      if (tradeType === TradeType.LIMIT && preTradeType.current === TradeType.MARKET) {
        updateSessionType(typeItem.code)
      }
      preTradeType.current = tradeType
    }, [tradeType, typeItem])
    
    const [open, setOpen] = useState(false)

    return (
      <Select 
        value={String(typeItem.code)} 
        onOpenChange={open => {
          setOpen(open)
        }}
        onValueChange={(code) => {
          if (code) {
            const session = sessionTypeList.find(s => String(s.code) === code)
            if (session && !session.disabled) {
              setTypeItem(session)
              updateSessionType(session.code)
            }
          }
          
        }}
      >
        <SelectTrigger 
          open={open}
          className={cn(
            "px-3 py-0 h-[38px] shadow-none flex items-center justify-between rounded-[4px] cursor-pointer bg-[#1A1B1E] ",
            className,
            from === 'lite-trade' ? ' bg-[#1A1B1E] border-none ' : ' border border-solid border-[rgba(35,36,39,1)]',
          )}
        >
          <div className={cn(
            "flex items-center gap-2 justify-between text-white font-normal text-[14px] w-full",
          )}>
            
            <IconWithTooltip side="left" tooltip={(
              <div className="">
                <div>
                  <span className=" font-semibold">{t('v3.t16') ?? ' '}：</span>
                  <span>{t('v3.t19', {duration: sessionTypeList[1]?.timeLabel})}</span>
                </div>
                <div className="mt-2">
                  <span className=" font-semibold">{t('v3.t17') ?? ' '}：</span>
                  <span> {t('v3.t20', {duration: sessionTypeList[0]?.timeLabel})}</span>
                </div>
                <div className="mt-2">
                  <span className=" font-semibold">{t('portfolio.overnight') ?? ' '}：</span>
                  <span> {t('v3.t201', {duration: sessionTypeList[2]?.timeLabel})}</span>
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
        <SelectContent align="end" className=" border-[#41464F] bg-[#1A1B1E] px-0 min-w-[232px]">
          {sessionTypeList.map(session => (
            <SelectItem key={session.code} value={String(session.code)} className={cn(
              "my-1 cursor-pointer px-0",
              session.disabled ? 'cursor-not-allowed text-[#737A87]' : 'cursor-pointer',
            )}>
              <IconWithTooltip side="left" tooltipClassName=" pr-8" triggerClassName="w-full" 
                tooltip={session.disabled ? (<>
                  <div className="text-[12px]">
                    <span>{t('v3.t203') + ' '}</span>
                    <span className="text-[#9DA3AF]">{session.timeLabel}</span> 
                    {session.code === SessionType.PRE_MARKET_AND_AFTER_HOURS ? <br /> : null}
                    （<span className="text-[#9DA3AF]">{t('v3.t204') + ' ' + session.timeLabelLocal}</span>）
                    <span>{t('v3.t205')}</span>
                  </div>
                </>) : undefined} >
                <div className="w-full px-3">
                  <div className={cn(
                    "flex items-center justify-between w-full text-white text-[12px]",
                    session.disabled ? 'cursor-not-allowed text-[#737A87]' : 'cursor-pointer',
                  )}>
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
              </IconWithTooltip>
              
              
            </SelectItem>
          ))}
        </SelectContent>
        
      </Select>
    )
  }
)

export { SessionTypeSelect }



