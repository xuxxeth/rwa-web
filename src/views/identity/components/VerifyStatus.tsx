import { LazyImage } from "@/components/image/LazyImage";
import { Button } from "@/components/ui/button";
import { Trans, useTranslation } from "@/hooks/useTranslation";
import { memo } from "react";


const VerifyStatus = memo(
  () => {
    const { t } = useTranslation()
    
    return (
      <div className=" text-white font-normal">
        <div className="flex flex-col items-center">
          <LazyImage src="/images/icons/identity/done.png" className="w-[268px]" />
          <div className="text-[24px] mt-10">{t('identity.state1')}</div>
          <div className="mt-2 text-[18px] text-[rgba(255,255,255,0.6)]">{t('identity.state2')}</div>
          <Button className="bg-white text-black w-full mt-10"
            onClick={async () => {
              
            }}
          >
            { t('identity.done') }
            
          </Button>
        </div>
        <div className="flex flex-col items-center">
          <LazyImage src="/images/icons/identity/fail.png" className="w-[268px]" />
          <div className="text-[24px] mt-10">{t('identity.state3')}</div>
          <div className="mt-2 text-[18px] text-[rgba(255,255,255,0.6)]">
            <Trans i18nKey={'identity.state4'}>
              账户状态异常，请联系 <a href="mailto:contact@cyberalpha.cc" className=" text-white">contact@cyberalpha.cc</a> 获取帮助
            </Trans>
          </div>
          <Button className="w-full mt-5" outline>
            <div className="flex items-center">
              <LazyImage src="/images/icons/identity/mail-02.png" className="w-6 h-6 mr-[10px]" />
              {t('identity.copyEmail')}
            </div>
          </Button>
        </div>
        <div className="flex flex-col items-center">
          <LazyImage src="/images/icons/identity/fail.png" className="w-[268px]" />
          <div className="text-[24px] mt-10">{t('identity.state5')}</div>
          <div className="mt-2 text-[18px] text-[rgba(255,255,255,0.6)]">
            {t('identity.state6')}
          </div>
          <Button className="bg-white text-black w-full mt-10"
            onClick={async () => {
              
            }}
          >
            { t('identity.reVerify') }
            
          </Button>
        </div>
        <div className="flex flex-col items-center">
          <LazyImage src="/images/icons/identity/success.png" className="w-[268px]" />
          <div className="text-[24px] mt-10">{t('identity.state7')}</div>
          <div className="mt-2 text-[18px] text-[rgba(255,255,255,0.6)]">
            {t('identity.state8')}
          </div>
          
        </div>
      </div>
    )
  }
)

export { VerifyStatus }