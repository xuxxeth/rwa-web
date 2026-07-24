import { LazyImage } from "../image/LazyImage"
import { useTranslation } from "@/hooks/useTranslation"
import { useTradeStore } from "@/stores/tradeStore"

const SplitTip = () => {
  const { t } = useTranslation()
  const inputToken = useTradeStore(state => state.inputToken)
  if (inputToken?.prevId) {
    return (
      <div className="p-3 bg-[#1A1B1E] rounded-[4px] text-[12px] text-[#FFB219] flex mt-3">
        <div className="w-[18px] h-[18px] shrink-0 mr-2">
          <LazyImage src="/images/v2/icons/warning.png" className="w-[18px] h-[18px]" />
        </div>
        
        <div>
          {t('events.t42')}
        </div>
        
      </div>
    )
  } 
  
  return null
}

export { SplitTip }