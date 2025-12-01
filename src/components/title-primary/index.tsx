import { cn } from "@/utils/tw";
import { memo } from "react";

const TitlePrimary = memo(
  ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
      <h2 className={cn(
        "title-primary font-medium text-[16px] sm:leading-[150%]",
        className
      )}>
        {children}
      </h2>
    );
  }
) 

export { TitlePrimary };