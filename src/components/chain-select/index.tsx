

import { Select, SelectTrigger, SelectContent, SelectItem,  } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { memo, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useBaseStore } from "@/stores/baseStore";
import type { IChain } from "@/service/base/types";

export type IncomeSelectProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (code: IChain) => void;
  className?: string
}

const ChainSelect = memo(
  ({
    defaultValue,
    value, 
    onChange, 
    className
  }: IncomeSelectProps) => {
    const { t, i18n } = useTranslation()
    const chains = useBaseStore(state => state.chainList)

    const allChains = useMemo(() => {
      return [
        { 
          "id": 10000,
          "name": 'ALL',
          "displayName": t('events.t79'),
          "state": 1, // 状态：0-不可用，1-可用
          "contract": '0x',
          "icon": '/images/v2/icons/chains.svg',
          "nativeToken": '',
          "rpc": '',
          "scan": '',
          "rpcUrls": [],

        },
        ...chains.filter(chain => chain.state === 1)
      ]
    }, [chains, t])

    const [currentCode, setCurrentCode] = useState(10000)
    const [currentItem, setCurrentItem] = useState(allChains[0])
    const [open, setOpen] = useState(false)

    return (
      <Select 
        value={value} 
        onOpenChange={open => {
          setOpen(open)
        }}
        onValueChange={(code) => {
          if (code) {
            setCurrentCode(Number(code))
            const _chain = allChains.find(chain => chain.id === Number(code))
            if (_chain) {
              setCurrentItem(_chain)
              onChange && onChange(_chain)
            }
          }
          
        }}
      >
        <SelectTrigger 
          open={open}
          className={cn(
            "px-3 py-0 h-[32px] shadow-none flex items-center justify-between rounded-[6px] border border-solid border-[#282A2F] ",
            className,
          )}
        >
          <div className="flex items-center gap-2 min-w-[114px] text-[#C7CCD6]">
            {currentCode ? (
              <>
                <img src={currentItem.icon} className="w-5 h-5" alt="" />
                <span className=" font-normal text-[14px]">{currentItem.displayName}</span>
              </>
            ) : (
              <span className="text-[14px] text-5">{''}</span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className="">
          {allChains.map(chain => (
            <SelectItem key={chain.id} value={String(chain.id)} className="h-[34px]">
              <div className="flex items-center justify-between w-full gap-2 text-white text-[14px]">
                <div className=" flex items-center  gap-x-2">
                  <img src={chain.icon} className="w-5 h-5" alt="" />
                  <span>{chain.displayName}</span>
                </div>
                <span
                  className="ml-auto data-[state=checked]:block hidden text-[#9CFF3A]"
                  data-state={chain.id === currentCode ? 'checked' : ''}
                >
                  <Check className="h-4 w-4 text-white" />
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
)

export { ChainSelect }



