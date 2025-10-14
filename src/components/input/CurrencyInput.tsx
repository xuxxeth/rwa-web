import { memo, useEffect, useMemo, useState } from "react"
import { NumberInput } from "./NumberInput"
import { LazyImage } from "../image/LazyImage"
import { cn } from "@/lib/utils"
import type { IRwa, IToken } from "@/service/base/types"

type CurrencyInputProps = {
  disabled?: boolean
  selectedToken?: IToken | IRwa | null
  mode?: string
  value?: string
  placeholder?: string
  from?: string
  regex?: string
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
            "flex-1 min-w-0",
            from === 'markets' ? ' placeholder:text-[18px] text-[18px] flex-1' : '',
            isInsufficient ? "text-[#FF593C]" : ""
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
            "bg-[#131823] rounded-[8px] h-[32px] flex items-center justify-center px-[8px] text-[#6C86AD] text-[16px] font-normal",
            from === 'markets' ? 'h-[25px] text-[14px]' : ''
          )}>
            USD
          </div>
        }
        {
          (mode === 'in' || mode === 'out') && 
            <div className="flex items-center cursor-pointer shrink-0 ml-2"
              onClick={() => {
                onCurrencyClick && onCurrencyClick()
              }}
            >
              {
                selectedToken?.icon && <LazyImage src={selectedToken?.icon} className={cn(
                  "w-[24px] h-[24px] rounded-full",
                  from === 'markets' ? 'w-[18px] h-[18px]' : ''
                )} />
              }
              {/* @ts-ignore */}
              <div className={cn(" text-[24px] font-medium ml-2 mr-1", from === 'markets' ? 'text-[16px]' : '')}>{selectedToken?.symbol || selectedToken?.rwa}</div>
              {
                from === 'markets' && mode === 'in' ? null :
                <LazyImage src="/images/convert/arrow-down.png" className="w-[24px] h-[24px]" />
              }
              
            </div>
        }
        
      </div>
    )
  }
)

export { CurrencyInput }