import { cn } from "@/utils";
import { memo, useState } from "react";
import { IconArrowDown } from "../icons/ArrowDown";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { CTokenList } from "../ctoken-list";
import { useTradeStore } from "@/stores/tradeStore";
import { LazyImage } from "../image/LazyImage";
import type { IRwa, IToken } from "@/service/base/types";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";


export const StockInfo = memo(
  ({inputToken}: {inputToken?: IRwa}) => {
    return (
      <div className="flex items-center">
        <div className="w-[54px] h-[54px]">
          {
            inputToken?.icon && <LazyImage src={inputToken?.icon} className="w-[54px] h-[54px] rounded-full" />
          }
        </div>
        
        <div className="ml-2 mr-5">
          <div className="text-[20px] font-medium ">{inputToken?.symbol || '--'}</div>
          <div className=" text-[14px] font-normal text-[rgba(255,255,255,0.6)]">{inputToken?.name || '--'}</div>
        </div>
        
      </div>
    )
  }
)

type StockSelectProps = {
  from?: string
}

export function StockSelect({
  from
}: StockSelectProps) {
  const inputToken = useTradeStore(state => state.inputToken)
  const updateInputToken = useTradeStore(state => state.updateInputToken)
  const [open, setOpen] = useState(false)

  useBodyScrollLock(open)

  if (from !== 'pro-trading') return <StockInfo inputToken={inputToken || undefined} />


  return (
    <HoverCard
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
      }}
    >
      <HoverCardTrigger asChild>
        <div className={cn(
          "flex items-center cursor-pointer",
        )}
          
        >
          <StockInfo inputToken={inputToken || undefined} />
          <IconArrowDown open={open} />
        </div>
      </HoverCardTrigger>
       <HoverCardContent align="start" 
          className="bg-[rgba(0,0,0,0)] w-[190px] border-none pt-3 -ml-[16px]"
       >
        <div 
          className="bg-[#131823] rounded-[8px] text-white relative w-full min-w-[470px] p-4"
          style={{boxShadow: '0px 5px 15px 0px rgba(0,0,0,0.25)'}}
        >
          <div className="h-[60px] w-[170px] absolute left-0 -top-[60px] bg-[rgba(0,0,0,0)]"></div>
          <CTokenList 
            from="StockSelect"
            onClick={(token) => {
              updateInputToken(token)
              setOpen(false)
            }}
          />
          
        </div>
        
      </HoverCardContent>
      
    </HoverCard>
  )
}