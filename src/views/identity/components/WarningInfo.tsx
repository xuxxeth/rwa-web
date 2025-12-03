import { LazyImage } from "@/components/image/LazyImage"
import { useTranslation } from "@/hooks/useTranslation"
import { memo } from "react"

const WarningInfo = memo(
  () => {
    const { t } = useTranslation()
    
    return (
      <div className="bg-[#361604] h-[48px] rounded-[4px] flex items-center text-white font-normal text-[16px] px-5">
        <LazyImage src="/images/kyc/warning.png" className="w-6 h-6 mr-[2px]" />
        {t('kyc.t1')}
      </div>
    )
  }
)

export { WarningInfo }