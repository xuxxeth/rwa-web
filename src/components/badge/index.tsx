import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "held" | "active" | "ended" | "suspended" | "pending";
  className?: string;
}

export function Badge({ children, variant = "held", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-[6px] h-[20px] rounded-[4px] text-[12px] font-medium leading-none border",
        variant === "held" && "bg-[rgba(156,255,58,0.08)] text-[#9cff3a] border-[rgba(156,255,58,0.35)]",
        variant === "active" && "bg-[rgba(156,255,58,0.08)] text-[#9cff3a] border-[rgba(156,255,58,0.35)]",
        variant === "ended" && "bg-[#232427] text-[#737a87] border-transparent",
        variant === "suspended" && "bg-[rgba(255,178,25,0.08)] text-[#ffb219] border-transparent",
        variant === "pending" && "bg-[rgba(0,157,255,0.08)] text-[#009dff] border-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}