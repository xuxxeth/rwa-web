import * as React from "react"

import { cn } from "@/lib/utils"

interface KycInputProps extends React.ComponentProps<"input"> {
  error?: string
  regex?: string
}

const KycInput = React.forwardRef<HTMLInputElement, KycInputProps>(
  ({ className, type, error, value, regex, ...props }, ref) => {
    const inputRegex = RegExp(regex || ".*")

    const handleBeforeInput = (e: React.InputEvent<HTMLInputElement>) => {
      if (!regex) {
        props.onBeforeInput && props.onBeforeInput(e)
        return
      }

      const nativeEvent = e.nativeEvent as InputEvent
      const inputType = nativeEvent.inputType || ""
      if (inputType.startsWith("delete") || inputType === "insertCompositionText") {
        props.onBeforeInput && props.onBeforeInput(e)
        return
      }

      const data = nativeEvent.data
      if (typeof data !== "string" || data.length === 0) {
        props.onBeforeInput && props.onBeforeInput(e)
        return
      }

      const target = e.currentTarget
      const start = target.selectionStart ?? target.value.length
      const end = target.selectionEnd ?? target.value.length
      const nextValue = target.value.slice(0, start) + data + target.value.slice(end)

      if (nextValue !== "" && !inputRegex.test(nextValue)) {
        e.preventDefault()
        return
      }

      props.onBeforeInput && props.onBeforeInput(e)
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (!regex) {
        props.onPaste && props.onPaste(e)
        return
      }

      const text = e.clipboardData.getData("text")
      const target = e.currentTarget
      const start = target.selectionStart ?? target.value.length
      const end = target.selectionEnd ?? target.value.length
      const nextValue = target.value.slice(0, start) + text + target.value.slice(end)

      if (nextValue !== "" && !inputRegex.test(nextValue)) {
        e.preventDefault()
        return
      }

      props.onPaste && props.onPaste(e)
    }

    return (
      <input
        type={type}
        className={cn(
          "caret-[#9CFF3A] flex h-[38px] w-full bg-[#1A1B1E] px-3 py-1 rounded-[4px] text-[14px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 outline-0 border border-[#1D1D1D] placeholder:text-[#737A87] ",
          className,
          error ? "border-[#CA3F64]" : "focus:border-[#FFFFFF]"
        )}
        ref={ref}
        pattern={regex}
        {...props}
        {...(value !== undefined ? { value } : {})}
        onBeforeInput={handleBeforeInput}
        onPaste={handlePaste}
        onChange={e => {
          props.onChange && props.onChange(e)
        }}
      />
    )
  }
)
KycInput.displayName = "KycInput"

export { KycInput }
