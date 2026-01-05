import { cn } from "@/utils"
import { useState } from "react"

export function GoButton({ onClick }: { onClick?: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      className="cursor-pointer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onClick && onClick()}
    >
      <img src="/images/icons/go.png" className={cn(
        "w-[24px] h-[24px]",
        hover ? 'drop-shadow': ''
      )} alt="" />
    </button>
  )
}