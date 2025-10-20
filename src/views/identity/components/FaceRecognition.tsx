import { LazyImage } from "@/components/image/LazyImage"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/useTranslation"

const FaceRecognition = (
  () => {
    const { t } = useTranslation()
    
    return (
      <div className=" text-white font-normal">
        <div className="text-[24px]">{t('identity.face')}</div>
        <div className="text-[rgba(255,255,255,0.6)] mt-2 font-normal">{t('identity.scqr')}</div>
        <div className="flex justify-center my-[56px]">
          <LazyImage src="/images/icons/identity/qr-code.png" className="w-[256px] h-[256px]" />
        </div>
        <div className="h-[27px] flex items-center relative">
          <div className="h-[1px] bg-[rgba(255,255,255,0.3)] w-full"></div>
          <div className=" absolute left-0 top-0 h-full right-0 bottom-0 flex justify-center items-center ">
            <div className="h-full px-5 bg-[rgba(6,7,10,1)] ">{t('identity.or')}</div>
          </div>
        </div>
        <div className="text-[rgba(255,255,255,0.6)] text-[18px] font-normal mt-[40px]">{t('identity.copyLinkTo')}</div>
        <Button className="w-full mt-5" outline>
          <div className="flex items-center">
            <LazyImage src="/images/icons/identity/link.png" className="w-6 h-6 mr-[10px]" />
            {t('identity.copylink')}
          </div>
        </Button>
        <div className=" flex items-center gap-x-2 mt-8 justify-center">
          <LazyImage src="/images/icons/identity/secue.png" className="w-6 h-6" />
          <div className="text-[rgba(255,255,255,0.6)] text-[16px] font-normal">{t('identity.infoVerification')}</div>
        </div>
      </div>
    )
  }
)

export { FaceRecognition }