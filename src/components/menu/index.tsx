import { ConnectButton } from "@/components/button/ConnectButton";
import { MenusItem } from "./MenuItem";
import { LngSubMenus } from "../button/LangSubMenus";
import { useTranslation } from "@/hooks/useTranslation";
import { SwitchButton } from "../button/SwitchChainButton";
import { useRouter } from "@/hooks/useRouter";
import { SubMenus } from "./SubMenus";
import { SettingSubMenus } from "../button/SettingSubMenus";
import { cn } from "@/utils/tw";
import { useMemo } from "react";

export function Menus() {
  const { t } = useTranslation();
  const router = useRouter();
  const className = useMemo(() => {
    return router.location.pathname === '/lite-trade' ? 'bg-[#1A1B1E]' : ''
  }, [router.location.pathname])

  return (
    <div className={cn(
      "h-[60px] flex items-center justify-between px-4 sticky left-0 top-0 w-full bg-[#131416] z-[49] header-menu",
      className
    )}>
      <div className="flex items-center">
        {/* <img src="./images/logo_text.png" className="w-[206px]" alt="" /> */}
        <div className=" flex items-center gap-x-[20px]">
        {/* <img onClick={() => router.push('/')} src="/images/logo_text.png" className="w-[206px] cursor-pointer" alt="" /> */}
        <img onClick={() => router.push('/')} src="/images/logo_dark_v2.svg" className="w-[55px] cursor-pointer" alt="" />
        <div className=" flex items-center gap-x-8 ml-8">
          {/* <MenusItem
            title={t("Homepage")}
            active={router.location.pathname === "/"}
            onClick={() => {
              router.push("/");
            }}
          /> */}
          <MenusItem
            title={t("Markets")}
            active={router.location.pathname.startsWith("/markets/quotes")}
            onClick={() => {
              router.push("/markets");
            }}
          />
          <SubMenus
            title={t("Trade")}
            active={router.location.pathname === "/lite-trade"}
            
          />
          
        </div>
        </div>
      </div>
      <div className="flex items-center gap-x-2">
        <SwitchButton />
        <ConnectButton />
        <LngSubMenus />
        <SettingSubMenus />
      </div>
    </div>
  );
}
