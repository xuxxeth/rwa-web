import { memo } from "react"
import { Input } from "../ui/input"

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)

function InnerInput({

}: {
  value: string | number
  onInput: (input: string) => void

}) {

  return (
    <Input
      className="flex-1 w-auto text-[28px] text-white font-semibold h-[42px]"
      placeholder="0"
    />
  )
}

export const NumberInput = memo(InnerInput)