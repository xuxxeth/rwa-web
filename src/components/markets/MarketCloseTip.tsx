import { useBaseStore } from "@/stores/baseStore"
import { LazyImage } from "../image/LazyImage"
import { MARKET_STATUS } from "@/config/constants"
import { useTranslation } from "@/hooks/useTranslation"
import { useTradeStore } from "@/stores/tradeStore"
import { TradeType } from "ca-common-web"

const MarketCloseTip = () => {
  const { t } = useTranslation()
  const marketTradeState = useBaseStore(state => state.marketTradeState)
  const tradeType = useTradeStore(state => state.tradeType)
  if (marketTradeState === MARKET_STATUS.OPEN || tradeType === TradeType.LIMIT) return null
  return (
    <div className="p-3 bg-[#1A1B1E] rounded-[4px] text-[12px] text-[#FFB219] flex mt-3">
      <div className="w-[18px] h-[18px] shrink-0 mr-2">
        <LazyImage src="/images/v2/icons/warning.png" className="w-[18px] h-[18px]" />
      </div>
      
      <div>
        {t('v2.tx.t23')}
      </div>
      
    </div>
  )
}

export { MarketCloseTip }