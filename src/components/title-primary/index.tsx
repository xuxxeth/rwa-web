import { cn } from "@/utils/tw";
import { memo } from "react";

const TitlePrimary = memo(
  ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
      <h2 className={cn(
        "title-primary font-medium text-[16px] leading-[150%] break-all",
        className
      )}>
        {children}
      </h2>
    );
  }
) 

export { TitlePrimary };