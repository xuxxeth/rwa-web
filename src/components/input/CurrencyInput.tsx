import { memo, useMemo } from "react"
import { NumberInput } from "./NumberInput"
import { LazyImage } from "../image/LazyImage"
import type { TokenProps } from "../token-list"
import type { CTokenProps } from "../ctoken-list"

type CurrencyInputProps = {
  disabled?: boolean
  selectedToken?: TokenProps | CTokenProps
  onCurrencyClick?: () => void
}

const CurrencyInput = memo(
  ({
    disabled,
    selectedToken,
    onCurrencyClick
  }: CurrencyInputProps) => {

    return (
      <div className="flex items-center justify-between">
        <NumberInput 
          disabled={disabled}
          value={""} onInput={input => {

        }} />
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
      </div>
    )
  }
)

export { CurrencyInput }