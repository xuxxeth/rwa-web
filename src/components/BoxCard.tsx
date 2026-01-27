import { cn } from "@/lib/utils";

export type BoxCardProps = {
  children?: React.ReactNode
  className?: string
}

export function BoxCard({ children, className }: BoxCardProps) {
  return (
    <div className={cn(
      "bg-[rgba(243,161,63,0.2)] p-6",
      className
    )}>
      { children }
    </div>
  )
}