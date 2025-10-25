import { type ReactNode } from "react";
import { cn } from "@/utils";
function ConentLayout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-[rgba(7,8,13,1)] min-h-[100vh] text-white ",
        className
      )}
    >
      {children}
    </div>
  );
}

export default ConentLayout;
