import { cn } from "@/lib/utils";
import { memo } from "react";

type ScrollBoxProps = {
  p: number; // 盒子的整体内边距，如：p = 24，则上、下、左为24，右为24/2 = 12，内div的右padding为24-12 = 12，内div做滚动可确保滚动条在肉眼可见上是在右边框和内div内容中间
  top?: number,
  pt?: number,
  pb?: number
  className?: string
  children?: React.ReactNode
}

const ScrollBox = memo(
  ({
    p = 24,
    top,
    pt,
    pb,
    className,
    children
  }: ScrollBoxProps) => {
    return (
      <div className=""
        style={{
          padding: p + 'px', paddingRight: p / 2 + 'px', 
          paddingTop: top !== undefined ? (top + 'px') : 'auto',
          paddingBottom: top !== undefined ? (top + 'px') : 'auto',
        }}
      >
        <div className={cn(
          "scroll-box h-[50vh] overflow-y-auto",
          className
        )}
        style={{paddingRight: p / 2 + 'px'}}
        >
          { children }
        </div>
      </div>
    )
  }
)

export { ScrollBox }