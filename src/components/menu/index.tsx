import { ConnectButton } from "@/components/button/ConnectButton";
import { MenusItem } from "./MenuItem";

export function Menus() {
  return (
    <div className="h-[88px] flex items-center justify-between px-5 fixed left-0 top-0 w-full bg-[#06070A] z-[49]">
      <div className="flex items-center">
        <img src="./images/logo_text.png" className="w-[206px]" alt="" />
        <div className=" flex items-center gap-x-[80px] ml-20">
          <MenusItem title="Homepage" />
          <MenusItem title="Pro Trade" />
          <MenusItem title="Convert" />
          <MenusItem title="Assets" />
        </div>
      </div>
      <div className="flex items-center">
        <ConnectButton />
        <div className=" flex items-center">
          <button className=" ml-4 cursor-pointer">
            <img src="./images/icons/menu.png" className="w-10 h-10" alt="" />
          </button>
          
        </div>
      </div>
    </div>
  )
}