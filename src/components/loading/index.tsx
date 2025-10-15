import { useTranslation } from "@/hooks/useTranslation"
import { LazyImage } from "../image/LazyImage"

const Loading = (
  () => {
    const { t } = useTranslation()

    return (
      <div className=" flex flex-col justify-center items-center">
        <LazyImage src="/images/icons/loading-white.png" className="w-[32px] h-[32px] animate-spin" />
        <div className=" text-white text-[14px] font-normal mt-2">{t('Loading')}...</div>
      </div>
    )
  }
)

export { Loading }