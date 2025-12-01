import { ConnectButton } from "@/components/button/ConnectButton";
import { MenusItem } from "./MenuItem";
import { LngSubMenus } from "../button/LangSubMenus";
import { useTranslation } from "@/hooks/useTranslation";
import { SwitchButton } from "../button/SwitchChainButton";
import { useRouter } from "@/hooks/useRouter";
import { SubMenus } from "./SubMenus";

export function Menus() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <div className="h-[88px] flex items-center justify-between px-5 sticky left-0 top-0 w-full bg-[#06070A] z-[49] header-menu">
      <div className="flex items-center">
        {/* <img src="./images/logo_text.png" className="w-[206px]" alt="" /> */}
        <img onClick={() => router.push('/')} src="/images/logo_text.png" className="w-[206px] cursor-pointer" alt="" />
        <div className=" flex items-center gap-x-[80px] ml-20">
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
          <MenusItem
            title={t("Assets")}
            active={router.location.pathname === "/assets"}
            onClick={() => {
              router.push("/assets");
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-x-2">
        <SwitchButton />
        <ConnectButton />
        <LngSubMenus />
      </div>
    </div>
  );
}
