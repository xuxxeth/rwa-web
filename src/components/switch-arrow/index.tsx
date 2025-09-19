import { cn } from "@/lib/utils"
import { memo } from "react"
import { LazyImage } from "../image/LazyImage"

function InnerSwitchArrow({
  className
}: {
  className?: string
}) {
  return (
    <div className={cn(
      "h-2 relative",
      className
    )}>
      <div className="bg-[#10141C] w-[48px] h-[48px] rounded-full border-4 border-[#06070A] flex items-center justify-center cursor-pointer
       absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]
      ">
        <LazyImage src="/images/convert/arrow-2.png" className="w-[24px] h-[24px]" />
      </div>
    </div>
    
  )
}

export const SwitchArrow = memo(InnerSwitchArrow)