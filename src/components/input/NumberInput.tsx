import { memo } from "react"
import { Input } from "../ui/input"
import { escapeRegExp } from "@/utils"
import { cn } from "@/lib/utils"

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)

type NumberInputProps = {
  disabled?: boolean
  value: string | number
  onInput: (input: string) => void
  placeholder?: string
  className?: string
}

const NumberInput = memo(
  ({
    className,
    value,
    disabled,
    placeholder,
    onInput
  }: NumberInputProps) => {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onInput(nextUserInput)
    }
  }    

    return (
      <Input
        disabled={disabled}
        className={cn(
          "flex-1 w-auto text-[28px] placeholder:text-[rgba(255,255,255,0.3)] placeholder:text-[20px] placeholder:font-medium disabled:opacity-100 text-white font-semibold h-[42px]",
          className
        )}
        placeholder={placeholder || '0'}
        value={value}
        onChange={e => {
          enforcer(e.target.value)
        }}
      />
    )
  }
)


export { NumberInput }