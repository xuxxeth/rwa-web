import { memo, useEffect, useMemo, useState } from "react"
import { NumberInput } from "../v2/input/NumberInput"
import { LazyImage } from "../image/LazyImage"
import { cn } from "@/lib/utils"
import type { IRwa, IToken } from "@/service/base/types"
import { USDTSelect } from "../usdt-select"
import { useTranslation } from "@/hooks/useTranslation"

type CurrencyInputProps = {
  disabled?: boolean
  selectedToken?: IToken | IRwa | null
  mode?: string
  value?: string
  placeholder?: string
  from?: string
  regex?: string | RegExp
  isInsufficient?: boolean
  onCurrencyClick?: () => void
  onUserInput?: (value: string) => void
  onFocus?: (focus: boolean) => void
}

const CurrencyInput = memo(
  ({
    disabled,
    mode,
    selectedToken,
    placeholder, 
    value,
    from,
    regex,
    isInsufficient,
    onCurrencyClick,
    onUserInput,
    onFocus
  }: CurrencyInputProps) => {
    const { t } = useTranslation()
    const [inputValue, setInputValue] = useState('')
    useEffect(() => {
      setInputValue(value || '')
    }, [value])

    return (
      <div className="flex items-center justify-between w-full">
        <NumberInput 
          className={cn(
            "flex-1 min-w-0 placeholder:text-[16px] text-[18px] font-medium disabled:text-[#9DA3AF] h-[23px]",
            isInsufficient ? "text-[#F6465D]" : ""
          )}
          placeholder={placeholder}
          disabled={disabled}
          value={inputValue} 
          regex={regex}
          onInput={input => {
            setInputValue(input)
            onUserInput && onUserInput(input)
          }} 
          onFocus={onFocus}
          
        />
        {
          mode === 'price' &&
          <div className={cn(
            "pl-[8px] text-[#FFFFFF] text-[12px] font-normal",
          )}>
            USD
          </div>
        }
        {
          mode === 'in' && 
            <div className="flex items-center cursor-pointer shrink-0 ml-2 border border-[#232427] bg-[#1A1B1E] px-[3px] rounded-full h-[21px]"
              onClick={() => {
                onCurrencyClick && onCurrencyClick()
              }}
            >
              {
                selectedToken?.icon && <LazyImage src={selectedToken?.icon} className={cn(
                  "w-[14px] h-[14px] rounded-full",
                )} />
              }
              {/* @ts-ignore */}
              <div className={cn(" text-[12px] font-normal mx-[2px]")}>{selectedToken?.symbol || selectedToken?.rwa}</div>
              
              <LazyImage src="/images/v2/icons/arrow-down-active.png" className="w-[12px] h-[12px] rotate-180 " />
              
            </div>
        }
        {
          mode === 'out' && (
            <USDTSelect 
              from="lite-trade"
              label={t('Order Value')}
              orderValue={'0'}
            />
          )
          
        }
        
      </div>
    )
  }
)

export { CurrencyInput }