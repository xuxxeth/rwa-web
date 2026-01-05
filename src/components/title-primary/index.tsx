import { cn } from "@/utils/tw";
import { memo } from "react";

const TitlePrimary = memo(
  ({ children, className, isZh }: { children: React.ReactNode, className?: string, isZh?: boolean }) => {
    return (
      <h2 className={cn(
        "title-primary font-medium text-[16px] sm:leading-[150%]",
        className
      )}
        style={{
          width: isZh ? '100%': 'auto'
        }}
      >
        {children}
      </h2>
    );
  }
) 

export { TitlePrimary };