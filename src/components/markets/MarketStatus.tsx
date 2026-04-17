import { CA_LANGUAGE, MARKET_STATUS, RWA_STATUS } from "@/config/constants"
import { useTradingStartTime } from "@/hooks/useMarketState"
import { useTranslation } from "@/hooks/useTranslation"
import { useTradeStore } from "@/stores/tradeStore"
import storage from "@/utils/storage"
import { cn } from "@/utils/tw"
import { memo, useMemo } from "react"
import IconWithTooltip from "../icon-tooltip"

const MarketStatus = memo(
  ({
    from,
    size
  }: {
    from?: string,
    size?: string
  }) => {
    const { t, i18n } = useTranslation()
    const tradingTime = useTradingStartTime()
    const inputToken = useTradeStore((state) => state.inputToken)

    const stateLabel = useMemo(() => {
      // 获取本地的语言环境
      const locale = storage.getItem(CA_LANGUAGE);
      
      // 如果 i18n 中的语言和本地存储的语言不一致，返回空
      if (i18n.language !== locale || !tradingTime) {
        return null;
      }
      // 根据语言环境返回不同的文本
      if (tradingTime?.tradeState === MARKET_STATUS.BEFORE) {
        return {
          t1: t("v3.t11"),
          t2: t("marketQuotes.mkHover", {
            session: t("marketQuotes.preMarket"),
            etTime: `${tradingTime.preOpenTime.H}:${tradingTime.preOpenTime.M} ~ ${tradingTime.openTime.H}:${tradingTime.openTime.M} ${t('v3.t31')}`,
            orderType: t("v3.t17") + ', ' + t('v3.t16')
          }),
          c: '#FFB219',
          i: '/images/v2/icons/pre.png'
        }
      }
      if (tradingTime?.tradeState === MARKET_STATUS.OPEN) {
        return {
          t1: t("v3.t12"),
          t2: t("marketQuotes.mkHover", {
            session: t("v3.t24"),
            etTime: `${tradingTime.openTime.H}:${tradingTime.openTime.M} ~ ${tradingTime.closeTime.H}:${tradingTime.closeTime.M} ${t('v3.t31')}`,
            orderType: t('v3.t16')
          }),
          c: '#2EE4A7',
          i: '/images/v2/icons/regular.png'
        }
      }
      
      if (tradingTime?.tradeState === MARKET_STATUS.AFTER) {
        return {
          t1: t("v3.t13"),
          t2: t("marketQuotes.mkHover", {
            session: t("marketQuotes.preMarket"),
            etTime: `${tradingTime.closeTime.H}:${tradingTime.closeTime.M} ~ ${tradingTime.afterCloseTime.H}:${tradingTime.afterCloseTime.M} ${t('v3.t31')}`,
            orderType: t("v3.t17") + ', ' + t('v3.t16')
          }),
          c: '#6366F1',
          i: '/images/v2/icons/after.png'
        }
      }
      if (tradingTime?.tradeState === MARKET_STATUS.OVERNIGHT) {
        return {
          t1: t("marketQuotes.overnight"),
          t2: t("marketQuotes.mkHover", {
            session: t("marketQuotes.overnight"),
            etTime: `${tradingTime.nightTradingStartTime.H}:${tradingTime.nightTradingStartTime.M} ~ ${tradingTime.nightTradingEndTime.H}:${tradingTime.nightTradingEndTime.M} ${t('v3.t31')}`,
            orderType: t("v3.t171") + ', ' + t('v3.t16')
          }),
          c: '#A855F7',
          i: '/images/v2/icons/night.png'
        }
      }
      return {
        t1: t("v3.t14"),
        t2: t("marketQuotes.mkHover", {
            session: t("v3.t14"),
            etTime: '--',
            orderType: t('v3.t16')
          }),
        c: '#C7CCD6',
        i: '/images/v2/icons/close_market.png'
      }
    }, [t, i18n, tradingTime])

    const tokenLabel = useMemo(() => {
      // 获取本地的语言环境
      const locale = storage.getItem(CA_LANGUAGE);
      
      // 如果 i18n 中的语言和本地存储的语言不一致，返回空
      if (i18n.language !== locale && !inputToken) {
        return null;
      }
      // 根据语言环境返回不同的文本
      if (inputToken?.state === RWA_STATUS.HALT) {
        return {
          t1: t("marketQuotes.tradingHalt"),
          t2: t("marketQuotes.thHover"),
          c: '#CA3F64',
          i: '/images/v2/icons/stop.png'
        }
      }
      if (inputToken?.state === RWA_STATUS.SELL) {
        return {
          t1: t("marketQuotes.buyForbidden"),
          t2: t("marketQuotes.buyForbidden"),
          c: '#CA3F64',
          i: '/images/v2/icons/sell.png'
        }
      }

      return null
    }, [t, i18n, inputToken])


    if (!stateLabel) {
      return null;
    }

    return (
      <div className=" flex items-center gap-x-2">
        <IconWithTooltip tooltip={stateLabel.t2}>
          <div className={cn(
            "px-2 flex items-center gap-x-1 bg-[#232427] h-[24px] rounded-[24px]",
            from === "lite-trade" ? "h-[50px] bg-[rgba(0,0,0,0)]" : "",
            tokenLabel ? "px-0 w-[24px] justify-center" : ""
          )}>
            <img src={stateLabel.i} className="w-[12px]" alt="" />
            {
              !tokenLabel && (
                <div className="text-[12px] leading-[14px] shrink-0"
                  style={{ color: stateLabel.c, }}
                >
                  {stateLabel.t1}
                </div>
              )
            }
            
            
          </div>
        </IconWithTooltip>
        {
          tokenLabel && (
            <IconWithTooltip tooltip={tokenLabel.t2}>
              <div className={cn(
                "px-2 flex items-center gap-x-1 bg-[#232427] h-[24px] rounded-[24px]",
                from === "lite-trade" ? "h-[50px] bg-[rgba(0,0,0,0)]" : ""
              )}>
                <img src={tokenLabel.i} className="w-[12px]" alt="" />
                <div className="text-[12px] leading-[14px] shrink-0"
                  style={{ color: tokenLabel.c, }}
                >
                  {tokenLabel.t1}
                </div>
                
              </div>
            </IconWithTooltip>
          )
        }
        
      </div>
      
      
    )
  }
)

export { MarketStatus }