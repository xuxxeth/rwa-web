import { memo, useEffect, useMemo, useState } from "react"
import { NumberInput } from "./NumberInput"
import { LazyImage } from "../../image/LazyImage"
import { cn } from "@/lib/utils"
import type { IRwa, IToken } from "@/service/base/types"

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
    const [inputValue, setInputValue] = useState('')
    useEffect(() => {
      setInputValue(value || '')
    }, [value])
    return (
      <div className="flex items-center justify-between w-full">
        <NumberInput 
          className={cn(
            "flex-1 min-w-0 text-right font-normal",
            from === 'markets' ? ' placeholder:text-[14px] text-[14px] flex-1' : '',
            isInsufficient ? "text-[#CA3F64]" : ""
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
            " flex items-center justify-center pl-[8px] pr-1 text-[#C7CCD6] text-[14px] font-normal",
            from === 'markets' ? 'h-[25px] text-[14px]' : ''
          )}>
            USD
          </div>
        }
        {
          (mode === 'in' || mode === 'out') && 
            <div className="flex items-center cursor-pointer shrink-0 ml-0"
              onClick={() => {
                onCurrencyClick && onCurrencyClick()
              }}
            >
              {/* @ts-ignore */}
              <div className={cn(" text-[14px] font-normal text-[#C7CCD6] ml-2 mr-1")}>{selectedToken?.symbol || selectedToken?.rwa}</div>
              
              <LazyImage src="/images/v2/icons/arrow-down.png" className="w-[16px] h-[16px]" />
              
            </div>
        }
        
      </div>
    )
  }
)

export { CurrencyInput }