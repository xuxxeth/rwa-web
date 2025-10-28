import { cn } from "@/lib/utils"
import { memo } from "react"

const IconArrowDown = memo(
  ({ open }: {open?: boolean}) => {
    return (
      <img src={open ? "/images/icons/down.png" : "/images/icons/down-60.png"} className={cn(
        "w-3 ml-2 transition-all",
        open ? ' rotate-180' : ''
      )} alt="" />
    )
  }
)

export { IconArrowDown }