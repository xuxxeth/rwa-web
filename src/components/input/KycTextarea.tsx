import * as React from "react"

import { cn } from "@/lib/utils"

interface KycTextareaProps extends React.ComponentProps<"textarea"> {
  error?: string
}

const KycTextarea = React.forwardRef<
  HTMLTextAreaElement,
  KycTextareaProps
>(({ className, error, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "caret-[#9CFF3A] flex w-full bg-[#1D1D1D] px-3 py-2 rounded-[6px] text-[16px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 outline-0 border border-[#1D1D1D] ",
        className,
        error ? "border-[#CA3F64]" : "focus:border-[#FFFFFF]"
      )}
      ref={ref}
      {...props}
    />
  )
})
KycTextarea.displayName = "KycTextarea"

export { KycTextarea }
