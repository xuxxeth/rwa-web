import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LazyImage } from "../image/LazyImage"

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-[8px] text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:border-[#1A1B1E] disabled:bg-[#1A1B1E] disabled:text-[#737A87] disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#FFFFFF] text-black",
        secondary: "bg-[#9CFF3A] text-black shadow-sm hover:bg-[#9CFF3A]/80",
        primary: "bg-[#25A750] text-black shadow-sm hover:bg-[#25A750]/80",
        warning: "bg-[#CA3F64] text-black shadow-sm hover:bg-[#CA3F64]/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[40px] px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-[56px] rounded-md px-8",
        icon: "h-9 w-9",
      },
      outline: {
        true: "", // 我们会在 compoundVariants 里定义具体样式
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        outline: true,
        className: "border border-[#E0E0E0] bg-[rgba(0,0,0,1)] text-white",
      },
      {
        variant: "secondary",
        outline: true,
        className: "border border-[#7ACC2F] bg-[rgba(0,0,0,1)] text-white",
      },
      {
        variant: "primary",
        outline: true,
        className: "border border-[#1BA54B] bg-[rgba(0,0,0,1)] text-white",
      },
      {
        variant: "warning",
        outline: true,
        className: "border border-[#D94A30] bg-[rgba(0,0,0,1)] text-white",
      },
      {
        variant: "ghost",
        outline: true,
        className: "border border-gray-400",
      },
      {
        variant: "link",
        outline: true,
        className: "border-b border-primary",
      },
      {
        outline: true,
        className: "disabled:border-[#1A1B1E] disabled:text-[#737A87] disabled:bg-[#1A1B1E]",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      outline: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, outline, asChild = false, loading = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, outline, className }))}
        ref={ref}
        {...props}
      >
        {loading && <LazyImage src="/images/icons/loading.png" className="w-[22px] h-[22px] animate-spin mr-1" />}
        {props.children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
