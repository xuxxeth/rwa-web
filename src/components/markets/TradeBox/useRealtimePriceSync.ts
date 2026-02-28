import { useCallback, useEffect, useRef, useState } from "react"
import BigNumber from "bignumber.js"
import { truncateUP } from "@/utils"
import { useRealtimeRwa } from "@/hooks/useRealtimeRwa"
import { TradeType } from "@/hooks/useCaCommon"
import type { IRwa, ITokenWithPrice } from "@/service/base/types"

interface UseRealtimePriceSyncParams {
  inputToken?: IRwa | null
  rwaPrice?: Record<string, any> | null
  realtimeData?: { p?: string | number } | null
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
  const preToken = useRef<IRwa | null>(null)
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
    if (!rwaPrice || !realtimeData) return

    if (tradeType === TradeType.MARKET) {
      initPrice.current = true
      setInputTokenPrice({ ...rwaPrice, price: String(realtimeData.p ?? 0) })
      return
    }

    if (!initPrice.current) {
      initPrice.current = true
      setInputTokenPrice({ ...rwaPrice, price: String(realtimeData.p ?? 0) })
    }
  }, [rwaPrice, realtimeData, tradeType])

  useEffect(() => {
    if (inputToken && realtimeData && preToken.current?.symbol !== inputToken.symbol) {
      preToken.current = inputToken
      if (rwaPrice) {
        setInputTokenPrice({ ...rwaPrice, price: String(realtimeData.p ?? 0) })
      }
    }
  }, [inputToken, rwaPrice, realtimeData])

  useEffect(() => {
    if (inputTokenPrice) {
      safeUpdateLimitPrice(truncateUP(inputTokenPrice.price ?? '0', 2))
    }
  }, [inputTokenPrice, safeUpdateLimitPrice])

  useEffect(() => {
    if (inputToken?.symbol && initPrice.current) {
      initPrice.current = false
    }
  }, [inputToken])

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

    if (value === 0 && inputTokenPrice) {
      safeUpdateLimitPrice(truncateUP(inputTokenPrice.price ?? '0', 2))
    }
  }, [inputTokenPrice, safeUpdateLimitPrice])

  useRealtimeRwa(inputToken ?? null)

  return {
    inputTokenPrice,
    handlePriceInput,
    handleChangePrice,
  }
}
