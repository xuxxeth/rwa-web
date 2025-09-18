import { cn } from "@/lib/utils";

export type BoxCardProps = {
  children?: React.ReactNode
  className?: string
}

export function BoxCard({ children, className }: BoxCardProps) {
  return (
    <div className={cn(
      "bg-second rounded-[8px] p-6",
      className
    )}>
      { children }
    </div>
  )
}