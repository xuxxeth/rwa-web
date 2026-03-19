

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/v2/ui/select";
import { cn } from "@/lib/utils";
import { memo, useEffect, useId, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { LazyImage } from "../image/LazyImage";
import { formatTokenAmountWithCommas, symbolToLower } from "@/utils";
import { useTokens } from "@/hooks/useTokens";
import { useBaseStore } from "@/stores/baseStore";
import { useTradeStore } from "@/stores/tradeStore";

export type IDoctypeCode = {
  code: string,
  icon: string,
  label: string,
}

export type USDTSelectProps = {
  value?: string;
  onChange?: (code: IDoctypeCode) => void;
  className?: string
  label?: string
  orderValue?: string
  from?: string
}

const USDTSelect = memo(
  ({
    value, 
    className,
    label,
    orderValue,
    from
  }: USDTSelectProps) => {
    const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)
    const tokenList = useTokens()
    const outputToken = useTradeStore(state => state.outputToken)
    const updateOutputToken = useTradeStore(state => state.updateOutputToken)

    const _id = useId()
    const tokenListWithBalance = useMemo(() => {
      return tokenList.map(rwa => {
        return {
          ...rwa,
          ...tokenWithBalance[symbolToLower(rwa.symbol)]
        }
      })
    }, [tokenList, tokenWithBalance])
    
    const [open, setOpen] = useState(false)

    return (
      <Select 
        value={value} 
        onOpenChange={open => {
          if (tokenListWithBalance.length > 1) {
            setOpen(open)
          }
        }}
        onValueChange={(code) => {
          if (code) {
            const _token = tokenList.find(token => token.address === code)
            if (_token) {
              updateOutputToken(_token)
            }
          }
          
        }}
      >
        <SelectTrigger 
          hideArrow={tokenListWithBalance.length <= 1}
          open={open}
          className={cn(
            "px-3 py-0 h-[38px] shadow-none flex items-center justify-between rounded-[4px] cursor-pointer",
            className,
            from === 'lite-trade' ? ' border-[#232427] w-auto bg-[#1A1B1E] px-[3px] rounded-full h-[21px] ' : ' border border-solid border-[rgba(35,36,39,1)]',
            open ? from !== 'lite-trade' ? 'border-[rgba(156,255,58,0.8)]' : '' : ''
          )}
        >
          <div className={cn(
            "flex items-center gap-2 justify-between text-white font-normal text-[14px] w-full",
          )}>
            {
              from === 'lite-trade' ? 
                <>
                  <div className="flex justify-between items-center w-full">
                    <div className="w-[14px] h-[14px]">
                      {
                        outputToken?.icon && <LazyImage src={outputToken?.icon} className="w-full h-full" />
                      }
                    </div>
                    <span className=" text-[#FFFFFF] text-[12px] ml-[2px] mr-[2px]">{outputToken?.symbol ?? '--'}</span>
                  </div>
                </>: 
                <>
                  <div className="text-[#9DA3AF]">{label ?? ' '}</div>
                  <div className="">
                    <span className={cn(
                      "text-[#9DA3AF]",
                    )}>{orderValue ?? ''}</span>
                    <span className=" text-[#C7CCD6] ml-2 mr-[6px]">{outputToken?.symbol ?? '--'}</span>
                  </div>
                </>
            }
            
          </div>
        </SelectTrigger>
        {
            tokenListWithBalance.length > 1 && (
              <SelectContent align="end" className=" border-[#41464F] bg-[#1A1B1E] px-0 min-w-[232px]">
                {tokenListWithBalance.map(token => (
                  <SelectItem key={token.address} value={token.address} className="my-1">
                    <div className="w-full">
                      <div className="flex items-center justify-between w-full text-white text-[12px]">
                        <span>{token.symbol}</span>
                        <span>{formatTokenAmountWithCommas(token.balance || '0')}</span>
                      </div>
                      <div className="flex items-center justify-between w-full text-[#9DA3AF] text-[12px]">
                        <span>{token.name}</span>
                        <span>{'≈ $'}{token.balance}</span>
                      </div>
                    </div>
                    
                  </SelectItem>
                ))}
              </SelectContent>
            )
        }
        
      </Select>
    )
  }
)

export { USDTSelect }



