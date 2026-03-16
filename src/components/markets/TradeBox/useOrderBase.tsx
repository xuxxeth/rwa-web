import { useMemo } from "react"
import BigNumber from "bignumber.js"

export function useOrderBase(limitPrice: string, inputSize: string) {
  return useMemo(() => {
    if (!Number(limitPrice) || !Number(inputSize)) return '0'
    return new BigNumber(limitPrice)
      .multipliedBy(inputSize)
      .decimalPlaces(6, BigNumber.ROUND_DOWN)
      .toFixed()
  }, [limitPrice, inputSize])
}
