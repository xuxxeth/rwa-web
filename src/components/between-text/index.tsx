import { memo } from "react";

type BetweenTextProps = {
  left: React.ReactNode | string
  right: React.ReactNode | string
}

const BetweenText = memo(
  ({left, right}: BetweenTextProps) => {
    return (
      <div className="flex items-center justify-between">
        <div className=" text-[#6C86AD]">{left}</div>
        <div>
          {right}
        </div>
      </div>
    )
  }
)

export { BetweenText }