import * as React from "react"

import { cn } from "@/lib/utils"
import { escapeRegExp } from "@/utils"
import { el } from "date-fns/locale"

interface KycInputProps extends React.ComponentProps<"input"> {
  error?: string
  regex?: string
}

const KycInput = React.forwardRef<HTMLInputElement, KycInputProps>(
  ({ className, type, error, value = '', regex, ...props }, ref) => {
    const inputRegex = RegExp(regex || '.*')
    const enforcer = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextUserInput = e.target.value
      if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
        e.target.value = nextUserInput
        props.onChange && props.onChange(e)
      } 
    }
    return (
      <input
        type={type}
        className={cn(
          "caret-[#9CFF3A] flex h-[44px] w-full bg-[#1D1D1D] px-3 py-1 rounded-[6px] text-[16px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 outline-0 border border-[#1D1D1D] ",
          className,
          error ? "border-[#CA3F64]" : "focus:border-[#FFFFFF]"
        )}
        ref={ref}
        {...props}
        value={value}
        onChange={e => {
          enforcer(e)
        }}
      />
    )
  }
)
KycInput.displayName = "KycInput"

export { KycInput }
