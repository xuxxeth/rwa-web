import { cn } from "@/lib/utils"
import { memo } from "react"

const IconArrowDown = memo(
  ({ open }: {open?: boolean}) => {
    return (
      <img src={open ? "/images/v2/icons/arrow-down-active.png" : "/images/v2/icons/arrow-down.png"} className={cn(
        "w-4 ml-2 transition-all",
      )} alt="" />
    )
  }
)

export { IconArrowDown }