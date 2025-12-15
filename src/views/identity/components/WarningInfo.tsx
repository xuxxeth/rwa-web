import { LazyImage } from "@/components/image/LazyImage"
import { useTranslation } from "@/hooks/useTranslation"
import { memo } from "react"

const WarningInfo = memo(
  ({
    text
  }: {
    text?: string
  }) => {
    const { t } = useTranslation()
    
    return (
      <div className="bg-[#361604] min-h-[48px] rounded-[4px] flex text-white font-normal text-[16px] px-5 py-3">
        <LazyImage src="/images/kyc/warning.png" className="w-6 h-6 mr-[2px]" />
        {text || t('kyc.t1')}
      </div>
    )
  }
)

export { WarningInfo }