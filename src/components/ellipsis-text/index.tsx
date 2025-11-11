import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { memo } from "react"
import { TooltipArrow } from "@radix-ui/react-tooltip"

interface EllipsisTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string
  maxWidth?: number | string // 支持数字或CSS宽度，如 200 或 "10rem"
}

const EllipsisText = memo(
  ({ text = '', maxWidth = 200, className }: EllipsisTextProps) => {
    const [isOverflowing, setIsOverflowing] = React.useState(false)
    const textRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      const el = textRef.current
      if (el) {
        setIsOverflowing(el.scrollWidth > el.clientWidth)
      }
    }, [text, maxWidth])

    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              ref={textRef}
              className={cn(
                "truncate whitespace-nowrap overflow-hidden text-ellipsis",
                className
              )}
              style={{ maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth }}
            >
              {text}
            </div>
          </TooltipTrigger>

          {isOverflowing && (
            <TooltipContent side="top" className="max-w-[400px] break-words">
              {text}
              <TooltipArrow className="fill-[#202835] backdrop-blur w-[19px] h-[9px]" />
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    )
  }
)

export { EllipsisText } 
