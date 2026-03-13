import { memo, useRef } from "react"
import { Input } from "../../ui/input"
import { cn } from "@/lib/utils"

export function normalizeInput(raw: string) {
  return raw.replace(/。/g, '.')
}

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
    const inputRef = useRef<HTMLInputElement>(null)

    const enforcer = (nextUserInput: string) => {
      const normalized = normalizeInput(nextUserInput)

      if (normalized === '' || inputRegex.test(normalized)) {
        onInput(normalized)
      }
    }

    const handleFocus = () => {
      onFocus?.(true)

      const el = inputRef.current
      if (!el) return

      // 下一帧把光标移到末尾
      requestAnimationFrame(() => {
        const len = el.value.length
        el.setSelectionRange(len, len)
      })
    }

    return (
      <Input
        ref={inputRef}
        disabled={disabled}
        className={cn(
          "caret-[#9CFF3A] leading-tight flex-1 w-full text-[14px] placeholder:text-[#737A87] placeholder:text-[14px] placeholder:font-normal disabled:opacity-100 text-white font-medium h-[38px]",
          className
        )}
        placeholder={placeholder || '0'}
        value={value}
        onChange={e => enforcer(e.target.value)}
        onFocus={handleFocus}
        onBlur={() => onFocus?.(false)}
      />
    )
  }
)

export { NumberInput }
