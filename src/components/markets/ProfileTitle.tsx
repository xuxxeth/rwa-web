import { cn } from "@/lib/utils"
import { memo } from "react"

const ProfileTitle = memo(
  ({
    title,
    className
  }: { title: string, className?: string }) => {
    return (
      <div className={cn(
        "bg-[rgba(255,255,255,0.04)] h-[33px] flex items-center px-2 text-[24px] font-medium rounded-[4px]",
        className
      )}>
        {title}
      </div>
    )
  }
)

export { ProfileTitle }