import type { IRwa, IToken } from "@/service/base/types"
import { useMemo } from "react"
import BigNumber from "bignumber.js"

export type TradeAction = "buy" | "sell"

export interface UseApproveAmountParams {
  paymentToken?: string
  orderValue?: string
  inputSize?: string
  action: TradeAction
  inputToken?: IRwa | null
  outputToken?: IToken | null
  estimatedFee?: number | string
  parseAmount: (value: string, decimals: number) => string
}

export function useApproveAmount({
  paymentToken,
  orderValue,
  inputSize,
  action,
  inputToken,
  outputToken,
  estimatedFee,
  parseAmount
}: UseApproveAmountParams): bigint {

  return useMemo(() => {
    if (!paymentToken) return 0n
    if (!inputToken || !outputToken) return 0n

    try {
      if (action === "buy") {
        if (!orderValue) return 0n
        const total = new BigNumber(orderValue).plus(
          new BigNumber(estimatedFee || 0)
        )

        return BigInt(
          parseAmount(total.toFixed(), outputToken.decimals)
        )
      }

      if (!inputSize) return 0n
      return BigInt(
        parseAmount(inputSize, inputToken.decimals)
      )
    } catch {
      return 0n
    }
  }, [
    paymentToken,
    orderValue,
    estimatedFee,
    inputSize,
    action,
    inputToken,
    outputToken,
    parseAmount
  ])
}
