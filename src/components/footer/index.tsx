import { useTranslation } from "@/hooks/useTranslation";
import { MainLayout } from "@/layouts/main";

export function XFooter() {
  const { t } = useTranslation()
  return (
    <MainLayout>
      <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.1)] pt-[46px] mt-[130px] pb-[130px] px-5 font-normal">
        <div>
          <img src="/images/logo_text.png" className="w-[182px]" alt="" />
          <div className=" text-base text-80 mt-[76px]">@ 2025 Cyber Alpha. {t('footer.text1')}</div>
        </div>
        <div className="flex text-base text-white gap-x-[100px]">
          <div>
            <div className=" font-semibold">{t('footer.text5')}</div>
            <div className="flex items-center mt-6">
              <img src="/images/icons/x.png" className="w-6" alt="" />
              <div className="text-80 ml-2">X Official</div>
            </div>
            <div className="flex items-center mt-8">
              <img src="/images/icons/tg.png" className="w-6" alt="" />
              <div className="text-80 ml-2">Telegram</div>
            </div>
          </div>
          <div>
            <div className=" font-semibold">{t('About')}</div>
            <div className="flex items-center mt-6">
              <div className="text-80">{t('FAQ')}</div>
            </div>
            <div className="flex items-center mt-8">
              <div className="text-80">{t('footer.text2')}</div>
            </div>
            <div className="flex items-center mt-8">
              <div className="text-80">{t('footer.text3')}</div>
            </div>
          </div>
          <div>
            <div className=" font-semibold">{t('footer.text4')}</div>
            <a href="mailto:contact@cyberalpha.cc">
            <div className="flex items-center mt-6">
              <img src="/images/icons/e_mail.png" className="w-6" alt="" />
              <div className="text-80 ml-2">contact@cyberalpha.cc</div>
            </div>
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}