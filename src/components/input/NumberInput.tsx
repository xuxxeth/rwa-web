import { memo } from "react"
import { Input } from "../ui/input"
import { escapeRegExp } from "@/utils"
import { cn } from "@/lib/utils"
import { normalizeInput } from "../v2/input/NumberInput"

type NumberInputProps = {
  disabled?: boolean
  value: string | number
  placeholder?: string
  className?: string
  regex?: string | RegExp
  onInput: (input: string) => void
  onFocus?: (focus: boolean) => void
}

const NumberInput = memo(
  ({
    className,
    value,
    disabled,
    placeholder,
    regex = '^(?:\\d+|\\d+\\.\\d{0,2})$',
    onInput,
    onFocus
  }: NumberInputProps) => {
  const inputRegex = regex instanceof RegExp ? regex : RegExp(regex)
  const enforcer = (nextUserInput: string) => {
    const normalized = normalizeInput(nextUserInput)
    if (normalized === '' || inputRegex.test(normalized)) {
      onInput(normalized)
    }
  }    

    return (
      <Input
        disabled={disabled}
        className={cn(
          "caret-[#9CFF3A] leading-tight flex-1 w-auto text-[28px] placeholder:text-[rgba(255,255,255,0.3)] placeholder:text-[20px] placeholder:font-medium disabled:opacity-100 text-white font-medium h-[42px]",
          className
        )}
        placeholder={placeholder || '0'}
        value={value}
        onChange={e => {
          enforcer(e.target.value)
        }}
        onFocus={() => {
          onFocus && onFocus(true)
        }}
        onBlur={() => {
          onFocus && onFocus(false)
        }}
      />
    )
  }
)


export { NumberInput }
