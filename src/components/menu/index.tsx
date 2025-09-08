import { ConnectButton } from "@/components/button/ConnectButton";
import { MenusItem } from "./MenuItem";
import { SubMenus } from "../button/SubMenus";
import { useTranslation } from "@/hooks/useTranslation";

export function Menus() {
  const { t } = useTranslation();
  return (
    <div className="h-[88px] flex items-center justify-between px-5 fixed left-0 top-0 w-full bg-[#06070A] z-[49]">
      <div className="flex items-center">
        <img src="./images/logo_text.png" className="w-[206px]" alt="" />
        <div className=" flex items-center gap-x-[80px] ml-20">
          <MenusItem title={t('Homepage')} active />
          <MenusItem title={t('Pro Trade')} />
          <MenusItem title={t('Convert')} />
          <MenusItem title={t('Assets')} />
        </div>
      </div>
      <div className="flex items-center">
        <ConnectButton />
        <SubMenus />
      </div>
    </div>
  )
}