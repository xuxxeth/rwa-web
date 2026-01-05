
import { useTranslation } from "@/hooks/useTranslation"
import { LazyImage } from "../image/LazyImage"

const NoData = (
  ({ noMore }: { noMore?: string }) => {
    const { t } = useTranslation()
    
    return (
      <div className=" flex flex-col justify-center items-center">
        <LazyImage src="/images/icons/no-data.png" className="w-[87px] h-[75px]" />
        <div className=" text-[rgba(255,255,255,0.6)] text-[14px] font-normal mt-4">{ noMore || t('No records found')}</div>
      </div>
    )
  }
)

export { NoData }