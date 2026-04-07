import { CA_LANGUAGE, MARKET_STATUS } from "@/config/constants"
import { useTradingStartTime } from "@/hooks/useMarketState"
import { useTranslation } from "@/hooks/useTranslation"
import storage from "@/utils/storage"
import { cn } from "@/utils/tw"
import { memo, useMemo } from "react"
import { LazyImage } from "../image/LazyImage"
import IconWithTooltip from "../icon-tooltip"
import i18n from "@/i18n"

const SupportOnlyRegular = memo(
  ({
    from,
    size
  }: {
    from?: string,
    size?: string
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
        }
      }
      
      if (tradingTime?.tradeState === MARKET_STATUS.AFTER) {
        return {
          t1: t("v3.t13"),
        }
      }
    }, [t, i18n, tradingTime])

    return (
      <div className={cn(
        "px-4 w-full",
        from === "lite-trade" ? 'px-0 mb-3' : ''
      )}>
        <IconWithTooltip triggerClassName="w-full" tooltip={t('v3.t33', { session: stateLabel?.t1 })} side="left">
          <div className={cn(
            "w-full px-3 flex gap-x-[6px] py-[7px] min-h-[38px] bg-[rgba(243,161,63,0.1)] border border-[rgba(243,161,63,0.2)] rounded-[4px]",
            (i18n.language === 'zh') ? ' items-center' : ' items-start',
          )}>
            <div className="w-[18px] h-[18px] shrink-0">
              <LazyImage src="/images/v2/icons/warning.png" className="w-[18px] h-[18px]" />
            </div>
            <span className="text-[#FFB219] text-[12px] font-normal leading-[100%]">{t('v3.t32')}</span>
          </div>
        </IconWithTooltip>
      </div>
      
    )
  }
)

export { SupportOnlyRegular }