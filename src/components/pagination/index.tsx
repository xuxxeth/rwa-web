import VectorSVG from "./vector.svg?react";
import { cn } from "@/utils";

export default function Pagination(props: {
  prev: { disabled: boolean; onClick: () => void };
  next: { disabled: boolean; onClick: () => void };
}) {
  const { prev, next } = props;
  return (
    <>
      {[
        {
          ...prev,
          className: "rotate-180",
        },
        {
          ...next,
          className: "",
        },
      ].map(({ className, disabled, onClick }) => (
        <button
          onClick={() => {
            if (disabled) return;
            onClick();
          }}
          className={cn(
            "w-10 h-10 flex items-center cursor-pointer justify-center bg-[rgba(255,255,255,0.2)] rounded-[12px]",
            disabled
              ? "bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.3)] pointer-events-none"
              : ""
          )}
        >
          <VectorSVG className={cn("w-[7px] h-[14px]", className)} />
        </button>
      ))}
    </>
  );
}
