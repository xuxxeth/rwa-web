import { cn } from "@/lib/utils"
import { memo } from "react"


const StatisticsItem = memo(
  ({ label, children, className }: { label?: string, children?: React.ReactNode, className?: string}) => {
    return (
      <div className={cn(
        "font-normal text-[rgba(255,255,255,0.6)] text-[14px] border-b border-[rgba(255,255,255,0.04)] flex flex-col justify-center py-2 px-2",
        className
      )}>
        <div className=" ">{label}</div>
        <div className=" text-white mt-1">{children}</div>
      </div>
    )
  }
)

export { StatisticsItem }