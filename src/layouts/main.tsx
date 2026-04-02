import { cn } from "@/utils/tw"

export function MainLayout({
  children,
  className
}: {
  children: React.ReactNode,
  className?: string
}) {

  return (
    <div className={cn(
      "xl:max-w-[1440px] mx-auto font-normal",
      className
    )}>
      {children}
    </div>
  )

}