import { useState } from "react";
import { cn } from "../../utils";

export type MenusItemPros = {
  title: string;
  active?: boolean
}

export function MenusItem({
  title,
  active = false
}: MenusItemPros) {
  const [hover ,setHover] = useState(false)

  return (
    <div 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
      " text-base text-white cursor-pointer h-10 flex flex-col items-center pt-1",
      active ? " font-bold" : ""
    )}>
      {title}
      {
        (active || hover) && <div className="w-full h-[4px] bg-[#9CFF3A] mt-1"></div>
      }
      
    </div>
  )
}