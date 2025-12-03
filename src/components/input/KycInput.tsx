import * as React from "react"

import { cn } from "@/lib/utils"

interface KycInputProps extends React.ComponentProps<"input"> {
  error?: string
}

const KycInput = React.forwardRef<HTMLInputElement, KycInputProps>(
  ({ className, type, error, ...props }, ref) => {
    
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
      />
    )
  }
)
KycInput.displayName = "KycInput"

export { KycInput }
