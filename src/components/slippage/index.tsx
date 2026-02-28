import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo, useId, useState } from "react"
import { Button } from "../ui/button"
import { SlippageCheckBox } from "../check-box"
import { NumberInput } from "../input/NumberInput"

type SlippageProps = {
  maxSlippage?: string,
  onConfirm?: (value: number) => void
}

const Slippage = memo(
  ({ maxSlippage, onConfirm }: SlippageProps) => {
    const { t } = useTranslation()
    const [current, setCurrent] = useState(0)
    const [inputValue, setInputValue] = useState('')

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
            <div className=" text-[12px]">3%</div>
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
                placeholder={`1～${maxSlippage || 5}`}
                regex={`^[1-${maxSlippage || 5}]$`}
                value={inputValue}
                onInput={(e) => {
                  setInputValue(e)
                  
                }}
              />
              <div className=" shrink-0">%</div>
            </div>
          </div>
        </div>
        <div className="px-6">
          <Button 
            disabled={current === 1 && (Number(inputValue) <= 0 || Number(inputValue) > Number(maxSlippage || 5))}
            onClick={() => onConfirm && onConfirm(current === 0 ? 3 : Number(inputValue))} 
            className="w-full h-[48px] rounded-[8px]">{t('Confirm')}
          </Button>
        </div>
      </div>
    )
  }
)

export { Slippage }