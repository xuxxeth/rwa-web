import { memo } from "react";
import { LazyImage } from "../image/LazyImage";

const SortButton = memo(({ order }: { order?: "asc" | "desc" }) => {
  return (
    <div className={"cursor-pointer"}>
      <LazyImage src="/images/icons/sort_up.png" className="w-[7px]" />
      <LazyImage
        src="/images/icons/sort_down.png"
        className="w-[7px] mt-[2px]"
      />
    </div>
  );
});

export { SortButton };
