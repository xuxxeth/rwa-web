import { memo } from "react"
import { NumberInput } from "./NumberInput"
import { LazyImage } from "../image/LazyImage"

type CurrencyInputProps = {
  onCurrencyClick?: () => void
}

const CurrencyInput = memo(
  ({
    onCurrencyClick
  }: CurrencyInputProps) => {
    return (
      <div className="flex items-center justify-between">
        <NumberInput 

          value={""} onInput={input => {

        }} />
        <div className="flex items-center cursor-pointer"
          onClick={() => {
            onCurrencyClick && onCurrencyClick()
          }}
        >
          <LazyImage src="/images/convert/usdt.png" className="w-[24px] h-[24px]" />
          <div className=" text-2xl font-medium ml-2 mr-1">USDT</div>
          <LazyImage src="/images/convert/arrow-down.png" className="w-[24px] h-[24px]" />
        </div>
      </div>
    )
  }
)

export { CurrencyInput }