import { memo, useEffect, useMemo, useState } from "react"
import { NumberInput } from "./NumberInput"
import { LazyImage } from "../image/LazyImage"
import type { TokenProps } from "../token-list"
import type { CTokenProps } from "../ctoken-list"

type CurrencyInputProps = {
  disabled?: boolean
  selectedToken?: TokenProps | CTokenProps
  mode?: string
  value?: string
  placeholder?: string
  onCurrencyClick?: () => void
  onUserInput?: (value: string) => void
}

const CurrencyInput = memo(
  ({
    disabled,
    mode,
    selectedToken,
    placeholder, 
    value,
    onCurrencyClick,
    onUserInput
  }: CurrencyInputProps) => {
    const [inputValue, setInputValue] = useState('')
    useEffect(() => {
      setInputValue(value || '')
    }, [value])
    return (
      <div className="flex items-center justify-between">
        <NumberInput 
          placeholder={placeholder}
          disabled={disabled}
          value={inputValue} 
          onInput={input => {
            setInputValue(input)
            onUserInput && onUserInput(input)
          }} 
          
        />
        {
          mode === 'price' &&
          <div className="bg-[#131823] rounded-[8px] h-[32px] flex items-center justify-center px-[8px] text-[#6C86AD] text-[16px] font-normal">
            USD
          </div>
        }
        {
          (mode === 'in' || mode === 'out') && 
            <div className="flex items-center cursor-pointer"
              onClick={() => {
                onCurrencyClick && onCurrencyClick()
              }}
            >
              {
                selectedToken?.icon && <LazyImage src={selectedToken?.icon} className="w-[24px] h-[24px]" />
              }
              {/* @ts-ignore */}
              <div className=" text-2xl font-medium ml-2 mr-1">{selectedToken?.symbol || selectedToken?.rwa}</div>
              <LazyImage src="/images/convert/arrow-down.png" className="w-[24px] h-[24px]" />
            </div>
        }
        
      </div>
    )
  }
)

export { CurrencyInput }