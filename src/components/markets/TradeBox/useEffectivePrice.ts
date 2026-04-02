import { useMemo } from "react"
import BigNumber from "bignumber.js"
import { TradeType } from "@/hooks/useCaCommon"

interface UseEffectivePriceParams {
  tradeType: TradeType
  action: "buy" | "sell"
  limitPrice: string
  slippage: number
}

export function useEffectivePrice({
  tradeType,
  action,
  limitPrice,
  slippage,
}: UseEffectivePriceParams) {
  return useMemo(() => {
    const basePrice = new BigNumber(limitPrice || 0)
    if (!basePrice.isFinite() || basePrice.lte(0)) return "0"

    if (tradeType !== TradeType.MARKET) {
      return basePrice.toString()
    }

    if (!Number.isFinite(slippage)) return basePrice.toString()

    const percent = new BigNumber(slippage).div(100)
    const nextPrice = action === "buy"
      ? basePrice.multipliedBy(new BigNumber(1).plus(percent))
      : basePrice.multipliedBy(new BigNumber(1).minus(percent))

    if (!nextPrice.isFinite() || nextPrice.lte(0)) return "0"
    return nextPrice.decimalPlaces(2, BigNumber.ROUND_DOWN).toFixed(2)
  }, [tradeType, action, limitPrice, slippage])
}
