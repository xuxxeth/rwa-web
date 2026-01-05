import { Financials } from "@/components/markets/Financials"
import { StockInfo } from "@/components/markets/Klinebody"
import { Profile } from "@/components/markets/Profile"
import { Statistics } from "@/components/markets/Statistics"
import { TradingChart } from "@/components/TVChart/TradingChart"
import { memo } from "react"

const KlineBody = memo(
  ({ from }: { from?: string }) => {

    return (
      <div>
        <StockInfo from="pro-trading" />
        <div className="mt-4">
          <TradingChart from={from} />
        </div>
        <Statistics from={from} />
        <Profile from={from} />
        <Financials />
      </div>
    )
  }
)

export { KlineBody }