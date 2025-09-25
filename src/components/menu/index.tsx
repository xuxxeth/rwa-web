import { ConnectButton } from "@/components/button/ConnectButton";
import { MenusItem } from "./MenuItem";
import { SubMenus } from "../button/SubMenus";
import { useTranslation } from "@/hooks/useTranslation";
import { SwitchButton } from "../button/SwitchChainButton";
import { useRouter } from "@/hooks/useRouter";

export function Menus() {
  const { t } = useTranslation();
  const router = useRouter()
  return (
    <div className="h-[88px] flex items-center justify-between px-5 fixed left-0 top-0 w-full bg-[#06070A] z-[49]">
      <div className="flex items-center">
        {/* <img src="./images/logo_text.png" className="w-[206px]" alt="" /> */}
        <img src="/images/logo_text.png" className="w-[206px]" alt="" />
        <div className=" flex items-center gap-x-[80px] ml-20">
          <MenusItem title={t('Homepage')} 
            active={router.location.pathname === '/'} 
            onClick={() => {
              router.push('/')
            }}
          />
          <MenusItem title={t('Markets')} 
            active={router.location.pathname === '/markets'} 
            onClick={() => {
              router.push('/markets')
            }}
          />
          <MenusItem title={t('Lite Trade')}
            active={router.location.pathname === '/lite-trade'} 
            onClick={() => {
              router.push('/lite-trade')
            }}
          />
          <MenusItem title={t('Assets')} />
        </div>
      </div>
      <div className="flex items-center gap-x-2">
        <SwitchButton />
        <ConnectButton />
        <SubMenus />
      </div>
    </div>
  )
}