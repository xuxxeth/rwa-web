import { memo } from "react"
import { NumberInput } from "./NumberInput"
import { LazyImage } from "../image/LazyImage"


function InnerCurrencyInput() {

  return (
    <div className="flex items-center justify-between">
      <NumberInput 

        value={""} onInput={input => {

      }} />
      <div className="flex items-center cursor-pointer">
        <LazyImage src="/images/convert/usdt.png" className="w-[24px] h-[24px]" />
        <div className=" text-2xl font-medium ml-2 mr-1">USDT</div>
        <LazyImage src="/images/convert/arrow-down.png" className="w-[24px] h-[24px]" />
      </div>
    </div>
  )
}

export const CurrencyInput = memo(InnerCurrencyInput)