import { useTranslation } from "@/hooks/useTranslation";
import { HomeButton } from "../button/HomeButton";
import { LngSubMenus } from "../button/LangSubMenus";
import { useRouter } from "@/hooks/useRouter";

export function HomeMenus() {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <div className="h-[44px] lg:h-[88px] flex items-center justify-between px-4 sm:px-5 sticky left-0 top-0 w-full bg-[#06070A] z-[49] header-menu">
      <div className="flex items-center">
        {/* <img src="./images/logo_text.png" className="w-[206px]" alt="" /> */}
        {/* <img src="/images/home/new/logo.png" className="w-[140px] sm:w-[171px] lg:w-[206px]" alt="" /> */}
        <img src="/images/logo_dark_v2.svg" className="w-[55px]" alt="" />
        
      </div>
      <div className="flex items-center gap-x-2 shrink-0">
        <HomeButton onClick={() => router.push('/trade')} type="launch" className="text-[14px] lg:text-[16px] h-[28px] lg:h-[41px]" >{t('newHome.btn1')}</HomeButton>
        <LngSubMenus from="home" />
      </div>
    </div>
  );
}
