import { useState } from "react";
import { cn } from "@/lib/utils"

export default function BaseIcon({
  src,
  activeSrc,
  onClick,
  className
}: {
  src: string
  activeSrc?: string
  onClick?: () => void
  className?: string
}) {
  const [isHover, setIsHover] = useState(false)

  return (
    <div className={cn(
      "w-8 h-8 flex items-center justify-center cursor-pointer",
      className
    )}
      onMouseOver={() => {
        
        setIsHover(true)
      }}
      onMouseLeave={() => {
        setIsHover(false)
      }}
      onClick={() => {
        onClick && onClick()
      }}
    >
      <img src={isHover && activeSrc ? activeSrc : src} alt="" className="w-full" />
    </div>
  )
}