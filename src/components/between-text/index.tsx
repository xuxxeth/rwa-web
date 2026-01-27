import { memo } from "react";

type BetweenTextProps = {
  left: React.ReactNode | string
  right: React.ReactNode | string
}

const BetweenText = memo(
  ({left, right}: BetweenTextProps) => {
    return (
      <div className="flex items-center justify-between text-[12px] font-normal">
        <div className=" text-[#9DA3AF]">{left}</div>
        <div>
          {right}
        </div>
      </div>
    )
  }
)

export { BetweenText }