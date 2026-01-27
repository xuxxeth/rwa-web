import { useState } from "react";
import { cn } from "../../utils";

export type MenusItemPros = {
  title: string;
  active?: boolean
  onClick?: () => void
}

export function MenusItem({
  title,
  active = false,
  onClick
}: MenusItemPros) {
  const [hover ,setHover] = useState(false)

  return (
    <div 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
      " text-[14px] font-medium text-[#9DA3AF] cursor-pointer h-[34px] flex flex-col items-center leading-[34px]",
      active ? "text-white" : ""
    )}
      onClick={() => {
        onClick && onClick()
      }}
    >
      {title}
      {/* {
        (active || hover) && <div className="w-full h-[4px] bg-[#9CFF3A] mt-1"></div>
      } */}
      
    </div>
  )
}