import { useRouter } from "@/hooks/useRouter"
import { LazyImage } from "../image/LazyImage"
import { useTranslation } from "@/hooks/useTranslation"
import { useTradeStore } from "@/stores/tradeStore"

const SplitTip = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const inputToken = useTradeStore(state => state.inputToken)
  if (inputToken?.prevId) {
    return (
      <div className="p-3 bg-[rgba(255,178,25,0.08)] rounded-[8px] text-[12px] text-[#FFB219] flex mt-3 border border-[rgba(255,178,25,0.1)]">
        <div className="w-[18px] h-[18px] shrink-0 mr-2">
          <LazyImage src="/images/v2/icons/warning.png" className="w-[18px] h-[18px]" />
        </div>
        
        <div>
          {t('events.t42')}
          <span className="text-[#9CFF3A] pl-1 cursor-pointer" onClick={e => router.push('/splits')}>{t('events.t38')} &gt;</span>
        </div>
        
      </div>
    )
  } 
  
  return null
}

export { SplitTip }