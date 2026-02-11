import type { IRwa, IToken } from "@/service/base/types"
import { useMemo } from "react"

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
    if (!orderValue) return 0n

    try {
      if (action === "buy") {
        const total =
          Number(orderValue) +
          Number(estimatedFee || 0)

        return BigInt(
          parseAmount(total.toString(), outputToken.decimals)
        )
      }

      return BigInt(
        parseAmount(inputSize || "0", inputToken.decimals)
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
