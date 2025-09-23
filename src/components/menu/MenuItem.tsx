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
      " text-base font-normal text-[rgba(255,255,255,0.6)] cursor-pointer h-10 flex flex-col items-center pt-1",
      active ? " font-semibold text-white" : ""
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