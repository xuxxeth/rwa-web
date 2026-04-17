import { MARKET_STATUS } from "@/config/constants"
import { useTradingStartTime } from "@/hooks/useMarketState"
import { useTranslation } from "@/hooks/useTranslation"
import { useTradeStore } from "@/stores/tradeStore"
import { memo, useMemo } from "react"
import { useBaseStore } from "@/stores/baseStore"
import { LazyImage } from "../image/LazyImage"

const RwaSessionStatus = memo(
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
    const marketTradeState = useBaseStore(state => state.marketTradeState)

    const notSupportBeforeOrAfter = useMemo(() => {
      if (!inputToken) {
        return false
      }
      if ((inputToken.sessionMaskList?.[1] === 0 && marketTradeState === MARKET_STATUS.AFTER) || 
        (inputToken.sessionMaskList?.[2] === 0 && marketTradeState === MARKET_STATUS.BEFORE)) {
        return true
      }
      return false
    }, [inputToken])

    const notSupportOvernight = useMemo(() => {
      if (!inputToken) {
        return false
      }
      if (inputToken.sessionMaskList?.[0] === 0 && marketTradeState === MARKET_STATUS.OVERNIGHT) {
        return true
      }
      return false
    }, [inputToken, marketTradeState])

    // 闭市状态下，
    if (marketTradeState === MARKET_STATUS.CLOSE) {
      return (
        <>
          <div className="min-h-[34px] flex items-center w-full py-3 px-4 bg-[#131416]">
            <div className="w-full bg-[rgba(243,161,63,0.1)] border border-[rgba(243,161,63,0.2)] text-[#FFB219] px-3 py-2 text-[12px] font-normal rounded-[4px] flex  gap-x-[6px]">
              <div className="w-[18px] h-[18px] shrink-0">
                <LazyImage src="/images/v2/icons/close2.png" className="w-[18px] h-[18px]" />
              </div>
              <span>{t("v3.t35")}</span>
            </div>
          </div>
          <div className='w-full bg-[#1A1B1E] h-[4px] shrink-0'>&nbsp;</div>
        </>
        
        
      )
    }

    // 不支持盘前盘后交易
    if (notSupportOvernight || notSupportBeforeOrAfter) {
      return (
        <>
          <div className="min-h-[34px] flex items-center w-full py-3 px-4 bg-[#131416]">
            <div className="w-full bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] text-[#A855F7] px-3 py-2 text-[12px] font-normal rounded-[4px] flex  gap-x-[6px]">
              <div className="w-[18px] h-[18px] shrink-0">
                <LazyImage src="/images/v2/icons/overnight.png" className="w-[18px] h-[18px]" />
              </div>
              <span>{t("v3.t36")}</span>
            </div>
          </div>
          <div className='w-full bg-[#1A1B1E] h-[4px] shrink-0'>&nbsp;</div>
        </>
        
      )
    
    }
    return null;  
    
  }
)

export { RwaSessionStatus }