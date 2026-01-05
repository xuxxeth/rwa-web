import { memo } from "react"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils";

const HomeButton = memo(
  ({ 
    type,
    className, 
    title,
    children,
    onClick
  }: {type?: string, className?: string, title?: string, children?: React.ReactNode,  onClick?: () => void}) => {
    return (
      <Button className={cn(
        "bg-white text-black w-full h-[34px] lg:h-[51px] rounded-[100px]",
        type === "launch" && "bg-[linear-gradient(180deg,#BEFF6E_0%,#6AFCDF_100%)]",
        type === "start" && "bg-[linear-gradient(180deg,#BEFF6E_0%,#6AFCDF_100%)]",
        className
      )}
        onClick={() => {
          onClick?.();
        }}
      >
        { children || title }       
      </Button>
    )
  }
)

export { HomeButton }