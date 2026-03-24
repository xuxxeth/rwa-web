import { CA_LANGUAGE, MARKET_STATUS } from "@/config/constants"
import { useTradingStartTime } from "@/hooks/useMarketState"
import { useTranslation } from "@/hooks/useTranslation"
import storage from "@/utils/storage"
import { cn } from "@/utils/tw"
import { memo, useMemo } from "react"

const PreMarketOpen = memo(
  ({
    from
  }: {
    from?: string
  }) => {
    const { t, i18n } = useTranslation()
    const tradingTime = useTradingStartTime()

    const stateLabel = useMemo(() => {
      // 获取本地的语言环境
      const locale = storage.getItem(CA_LANGUAGE);
      
      // 如果 i18n 中的语言和本地存储的语言不一致，返回空
      if (i18n.language !== locale) {
        return null;
      }
      
      // 根据语言环境返回不同的文本
      if (tradingTime?.tradeState === MARKET_STATUS.BEFORE) {
        return {
          t1: t("v3.t11"),
          t2: t("v3.t15") + t("v3.t12") + t('Trade'),
          c: '#FFB219',
          i: '/images/v2/icons/market_before.png'
        }
      }
      if (tradingTime?.tradeState === MARKET_STATUS.OPEN) {
        return {
          t1: t("v3.t12"),
          t2: t("v3.t15") + t("v3.t13") + t('Trade'),
          c: '#2EE4A7',
          i: '/images/v2/icons/market_trading.png'
        }
      }
      
      if (tradingTime?.tradeState === MARKET_STATUS.AFTER) {
        return {
          t1: t("v3.t13"),
          t2: t("v3.t15") + t("v3.t14"),
          c: '#009DFF',
          i: '/images/v2/icons/market_after.png'
        }
      }
      return {
        t1: t("v3.t14"),
        t2: t("v3.t15") + t("v3.t11") + t('Trade'),
        c: '#FFB219',
        i: '/images/v2/icons/market_after_close.png'
      }
    }, [t, i18n, tradingTime])

    if (!stateLabel) {
      return null;
    }

    return (
      <div className={cn(
        "px-3 flex items-center gap-x-2 gap-y-1 flex-wrap content-center",
        from === "lite-trade" ? "h-[50px]" : ""
      )}>
        <img src={stateLabel.i} className="w-[18px]" alt="" />
        <div className="text-[12px] leading-[14px] shrink-0">{stateLabel.t1} | {stateLabel.t2}</div>
        <div className={cn(
          "text-[14px] min-w-[100px]",
          stateLabel.c ? `text-[${stateLabel.c}]` : ''
        )}>
          <div className="flex items-center">
            <div className="flex items-center font-mono">
              <div className="text-center">
                {tradingTime?.countdown?.H}
              </div>H
            </div>
            <div className="px-[4px]">:</div>
            <div className="flex items-center font-mono">
              <div className="text-center">{tradingTime?.countdown?.M}</div>M
            </div>
            <div className="px-[4px]">:</div>
            <div className="flex items-center font-mono">
              <div className="text-center">{tradingTime?.countdown?.S}</div>S
            </div>
          </div>
          
        </div>
        
        
      </div>
      
    )
  }
)

export { PreMarketOpen }