import { memo } from "react"
import { Input } from "../ui/input"

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)

type NumberInputProps = {
  value: string | number
  onInput: (input: string) => void
}

const NumberInput = memo(
  ({}: NumberInputProps) => {
    return (
      <Input
        className="flex-1 w-auto text-[28px] text-white font-semibold h-[42px]"
        placeholder="0"
      />
    )
  }
)


export { NumberInput }