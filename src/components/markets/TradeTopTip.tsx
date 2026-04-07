import { useTradingStartTime } from "@/hooks/useMarketState"
import { SupportOnlyRegular } from "./SupportOnlyRegular"
import { MARKET_STATUS } from "@/config/constants"
import { PreMarketOpen } from "./PreMarketOpen"
import { useSupportRegular } from "@/hooks/useSupportRegular"
import { useTradeStore } from "@/stores/tradeStore"
import { useMemo } from "react"

const TradeTopTip = ({
    from,
    size
  }: {
    from?: string,
    size?: string
  }) => {
  const tradingTime = useTradingStartTime()
  const inputToken = useTradeStore(state => state.inputToken)
  const { isSupportRegular } = useSupportRegular()

  const isRegular = useMemo(() => {
    return isSupportRegular(inputToken?.symbol || '') && (tradingTime?.tradeState === MARKET_STATUS.BEFORE || tradingTime?.tradeState === MARKET_STATUS.AFTER)
  }, [inputToken, tradingTime])

  if (isRegular) {
    return (
      <SupportOnlyRegular from={from} />
    )
  }
  if (from === "lite-trade" && !isRegular) {
    return null
  }
  return <PreMarketOpen size={size} from={from} />
  
}

export {
  TradeTopTip
}
