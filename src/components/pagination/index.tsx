import { useId } from "react";
import VectorSVG from "./vector.svg?react";
import { cn } from "@/utils";

export default function Pagination({
  currentPage,
  totalPage,
  onPrevClick,
  onNextClick,
  scrollToTopAferClick = true,
}: {
  currentPage: number;
  totalPage: number;
  onPrevClick: () => void;
  onNextClick: () => void;
  // prev: { disabled: boolean; onClick: () => void };
  // next: { disabled: boolean; onClick: () => void };
  scrollToTopAferClick?: boolean;
}) {
  const _id = useId()
  return (
    <div className="flex gap-4 py-2 mt-9 flew-row justify-center">
      {[
        {
          onClick: onPrevClick,
          className: "rotate-180",
          disabled: currentPage === 1,
        },
        {
          disabled: currentPage === totalPage,
          onClick: onNextClick,
          className: "",
        },
      ].map(({ className, disabled, onClick }, index) => (
        <button
          key={`${_id}-${index}`}
          onClick={() => {
            if (disabled) return;
            onClick();
            if (scrollToTopAferClick) {
              ScrollToTop();
            }
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
    </div>
  );
}

// 分页切换的时候，滚动到顶部
function ScrollToTop() {
  window.scrollTo({ top: 0, behavior: "auto" });
}
