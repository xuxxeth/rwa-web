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
      <img src="./images/icons/go.png" className={cn(
        "w-[50px] h-[50px]",
        hover ? 'drop-shadow': ''
      )} alt="" />
    </button>
  )
}