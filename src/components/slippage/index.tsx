import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo, useEffect, useState } from "react"
import { Button } from "../ui/button"
import { SlippageCheckBox } from "../check-box"
import { NumberInput } from "../input/NumberInput"
import { DEFAULT_SLIPPAGE } from "@/config/constants"

type SlippageProps = {
  maxSlippage?: string,
  slippage?: number,
  onConfirm?: (value: number) => void
}

const Slippage = memo(
  ({ maxSlippage, slippage, onConfirm }: SlippageProps) => {
    const { t } = useTranslation()
    const [current, setCurrent] = useState(0)
    const [inputValue, setInputValue] = useState('')
    const max = Number(maxSlippage)
    const maxValue = Number.isFinite(max) && max > 0 ? Math.floor(max) : 3

    useEffect(() => {
      if (typeof slippage !== "number") return
      if (slippage !== DEFAULT_SLIPPAGE) {
        setCurrent(1)
        setInputValue(String(slippage))
        return
      }
      setCurrent(0)
      setInputValue("")
    }, [slippage])

    return (
      <div className="w-[410px]">
        <div className="px-[50px] py-9 border-t border-[#232427]">
          <div className={cn(
            "h-[44px] border border-[#232427] bg-[#1A1B1E] rounded-[4px] px-[15px] flex items-center justify-between cursor-pointer",
            current === 0 ? "border-[#25A750] bg-[rgba(37,167,80,0.2)] text-white" : " text-[#9DA3AF]"
          )}
            onClick={() => {
              setCurrent(0)
            }}
          >
            <div className="flex items-center gap-x-2">
              <SlippageCheckBox checked={current === 0} />
              <div className="ml-2">{t('v3.t3')}</div>
            </div>
            <div className=" text-[12px]">{DEFAULT_SLIPPAGE}%</div>
          </div>
          <div className={cn(
            "h-[59px] border border-[#232427] bg-[#1A1B1E] rounded-[4px] px-[15px] flex items-center justify-between cursor-pointer mt-5",
            current === 1 ? "border-[#25A750] " : ""
          )}
            onClick={() => {
              setCurrent(1)
            }}
          >
            <div className="flex items-center gap-x-2">
              <SlippageCheckBox checked={current === 1} />
              <div className="ml-2">{t('v3.t4')}</div>
            </div>
            <div className="bg-[#131416] px-2 rounded-[4px] h-[31px] w-[129px] flex items-center justify-between text-[#9DA3AF] text-[12px]">
              <NumberInput
                className="text-[12px] h-[29px] placeholder:text-[12px] text-center  w-[100px]" 
                placeholder={`0.1～${maxValue}`}
                regex={/^(?:[0-2](?:\.[0-9]{0,1})?|3(?:\.0?)?)$/}
                value={inputValue}
                onInput={(value) => {
                  setInputValue(value)
                  
                }}
              />
              <div className=" shrink-0">%</div>
            </div>
          </div>
        </div>
        <div className="px-6">
          <Button 
            disabled={current === 1 && (maxValue <= 0 || Number(inputValue) <= 0 || Number(inputValue) > maxValue)}
            onClick={() => onConfirm && onConfirm(current === 0 ? DEFAULT_SLIPPAGE : Number(inputValue))} 
            className="w-full h-[48px] rounded-[8px]">{t('Confirm')}
          </Button>
        </div>
      </div>
    )
  }
)

export { Slippage }
