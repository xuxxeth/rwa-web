import { useCallback, useEffect, useRef, useState } from "react"
import BigNumber from "bignumber.js"
import { truncate, truncateUP } from "@/utils"
import { useRealtimeRwa } from "@/hooks/useRealtimeRwa"
import { TradeType } from "@/hooks/useCaCommon"
import type { IRwa, ITokenWithPrice } from "@/service/base/types"

interface UseRealtimePriceSyncParams {
  inputToken?: IRwa | null
  rwaPrice?: Record<string, any> | null
  realtimeData?: { S?: string; p?: string | number } | null
  tradeType: TradeType
  limitPrice: string
  updateLimitPrice: (price: string) => void
}

export function useRealtimePriceSync({
  inputToken,
  rwaPrice,
  realtimeData,
  tradeType,
  limitPrice,
  updateLimitPrice,
}: UseRealtimePriceSyncParams) {
  const initPrice = useRef(false)
  const prevSymbolRef = useRef<string>("")
  const limitPriceRef = useRef(limitPrice)
  const [inputTokenPrice, setInputTokenPrice] = useState<ITokenWithPrice | null>(null)

  useEffect(() => {
    limitPriceRef.current = limitPrice
  }, [limitPrice])

  const safeUpdateLimitPrice = useCallback((nextPrice: string) => {
    if (nextPrice !== limitPriceRef.current) {
      updateLimitPrice(nextPrice)
    }
  }, [updateLimitPrice])

  useEffect(() => {
    const currentSymbol = inputToken?.symbol || ""
    if (!currentSymbol) return
    if (prevSymbolRef.current !== currentSymbol) {
      prevSymbolRef.current = currentSymbol
      initPrice.current = false
      setInputTokenPrice(null)
      limitPriceRef.current = ''
      updateLimitPrice('')
    }
  }, [inputToken?.symbol, updateLimitPrice])

  useEffect(() => {
    if (!inputToken?.symbol || !realtimeData) return
    if (realtimeData.S && realtimeData.S !== inputToken.symbol) return
    if (!Number(realtimeData.p ?? 0)) return

    if (tradeType === TradeType.MARKET || !initPrice.current) {
      initPrice.current = true
      setInputTokenPrice({ ...(rwaPrice ?? {}), price: String(realtimeData.p ?? 0) } as ITokenWithPrice)
    }
  }, [inputToken?.symbol, rwaPrice, realtimeData, tradeType])

  useEffect(() => {
    if (inputTokenPrice) {
      if (!Number(inputTokenPrice.price ?? 0)) return
      safeUpdateLimitPrice(truncate(inputTokenPrice.price ?? '0', 2))
    }
  }, [inputTokenPrice, safeUpdateLimitPrice])

  const handlePriceInput = useCallback((value: string) => {
    safeUpdateLimitPrice(value)
  }, [safeUpdateLimitPrice])

  const handleChangePrice = useCallback((value: number) => {
    const basePrice = inputTokenPrice?.price ?? '0'

    if (Number(basePrice) && value !== 0) {
      const changeValue = new BigNumber(basePrice)
        .multipliedBy(Math.abs(value))
        .dividedBy(100)
        .decimalPlaces(2, BigNumber.ROUND_UP)
      const newPrice = value > 0
        ? new BigNumber(basePrice).plus(changeValue).toFixed(2)
        : new BigNumber(basePrice).minus(changeValue).isLessThan(0)
          ? '0'
          : new BigNumber(basePrice).minus(changeValue).toFixed(2)
      safeUpdateLimitPrice(newPrice)
      return
    }

    if (value === 0 && Number(realtimeData?.p ?? 0) > 0) {
      safeUpdateLimitPrice(truncate(String(realtimeData?.p ?? 0), 2))
    }
  }, [inputTokenPrice, realtimeData?.p, safeUpdateLimitPrice])

  useRealtimeRwa(inputToken ?? null)

  return {
    inputTokenPrice,
    handlePriceInput,
    handleChangePrice,
  }
}
