import { LazyImage } from "@/components/image/LazyImage";
import { cn } from "@/utils/tw";
import { memo } from "react";

const PositionRwa = memo(
  ({
    className,
    src
  }: { 
    className?: string,
    src: string
  }) => {
    return (
      <div className={cn(
        "w-[70px] h-[70px] rounded-full absolute overflow-hidden opacity-60 p-2",
        className
      )}>
        <LazyImage src={src} className="w-full h-full"
          style={{"filter": "blur(3px)"}}
        />
        
      </div>
    )
  }
)

export { PositionRwa }