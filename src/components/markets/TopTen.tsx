import { cn } from "@/lib/utils"
import type { IToptenshareholder } from "@/service/base/types"
import { memo } from "react"
import { ProfileTitle } from "./ProfileTitle"
import { formatLargeNumber, toFixed } from "@/utils/format"

const TopHeader = () => {
  return (
    <div className="flex items-center h-[41px] text-[rgba(255,255,255,0.6)] text-[14px] font-medium gap-x-4 px-5">
      <div className="flex-1">Investment Institution / Natural Person</div>
      <div className="w-[185px] text-right">Shareholding (Share)</div>
      <div className="w-[94px] text-right">Ratio</div>
      <div className="w-[213px] text-right">Shareholding Change (Share)</div>
    </div>
  )
}

const TopItem = ({
  top,
  className
}: {
  top: IToptenshareholder,
  className?: string
}) => {
  return (
    <div className={cn(
      "flex items-center h-[35px] text-[rgba(255,255,255,0.6)] text-[14px] font-medium gap-x-4 px-5 my-2",
      className
    )}>
      <div className="flex-1">{top.investor}</div>
      <div className="w-[185px] text-right">{formatLargeNumber(top.heldSharesVolume)}</div>
      <div className="w-[94px] text-right">{toFixed(top.proportion)}%</div>
      <div className="w-[213px] text-right">{formatLargeNumber(top.shareHoldingChange)}</div>
    </div>
  )
}

const TopTen = memo(
  ({
    topTen
  }: {
    topTen: IToptenshareholder[]
  }) => {

    return (
      <div className="mt-[24px] text-white">
        <ProfileTitle title="Top Ten Shareholders" />
        <div className="mt-6 border border-[rgba(255,255,255,0.1)] rounded-[4px]">
          <TopHeader />
          {
            topTen.map((top, index) => {
              return <TopItem key={top.investor} top={top} className={`${index % 2 === 0 ? "bg-[rgba(255,255,255,0.04)]" : ""}`}/>
            })
          }
          
        </div>
      </div>
    )
  }
)

export { TopTen }