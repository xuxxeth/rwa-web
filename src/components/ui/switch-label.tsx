import { cn } from "@/utils/tw"
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

type SwitchProps =
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    checkedLabel?: React.ReactNode
    uncheckedLabel?: React.ReactNode
  }

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, checkedLabel, uncheckedLabel, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "group relative peer inline-flex h-6 w-[54px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-[#25A750] data-[state=unchecked]:bg-[#41464F]",
      className
    )}
    {...props}
  >
    {/* 文案层 */}
    {(checkedLabel || uncheckedLabel) && (
      <>
        <span
          className={cn(
            "pointer-events-none absolute left-[5px] text-[12px] text-white font-medium transition-opacity",
            "opacity-0 group-data-[state=checked]:opacity-100"
          )}
        >
          {checkedLabel}
        </span>
        <span
          className={cn(
            "pointer-events-none absolute right-[5px] text-[12px] font-medium text-[#FFFFFF] transition-opacity",
            "opacity-0 group-data-[state=unchecked]:opacity-100"
          )}
        >
          {uncheckedLabel}
        </span>
      </>
    )}

    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none relative z-10 block h-[18px] w-[18px] rounded-full bg-[#FFFFFF] shadow-lg ring-0 transition-transform",
        "data-[state=checked]:translate-x-[32px] data-[state=unchecked]:translate-x-[2px]"
      )}
    />
  </SwitchPrimitives.Root>
))

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
