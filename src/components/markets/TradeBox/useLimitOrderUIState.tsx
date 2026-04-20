// hooks/useLimitOrderUIState.ts

import { useMemo } from "react"
import BigNumber from "bignumber.js"
import { isGreater, isLess } from "@/utils"
import type { IRwa, IToken } from "@/service/base/types"
import type { TFunction } from "i18next"
import { RWA_STATUS } from "@/config/constants"

/**
 * 余额结构
 */
export interface TokenBalance {
  balance?: string
}

/**
 * Hook 入参类型
 */
export interface UseLimitOrderUIStateParams {
  limitPrice: string
  orderValue: string
  inputSize: string

  inputToken?: IRwa | null
  outputToken?: IToken | null

  action: "buy" | "sell"

  inputTokenBalance?: TokenBalance | null
  outputTokenBalance?: TokenBalance | null

  effectivePrice: string
  realtimePrice?: string

  t: TFunction
  language: string
}

/**
 * Hook 返回类型
 */
export interface UseLimitOrderUIStateResult {
  disabled: boolean
  buttonText: string
  isBuyInsufficient: boolean
  isSellInsufficient: boolean
  isMin: boolean
  isMax: boolean
}

/**
 * 负责 UI 层状态计算：
 * - disabled
 * - buttonText
 * - insufficient
 * - min/max
 */
export function useLimitOrderUIState({
  limitPrice,
  orderValue,
  inputSize,
  inputToken,
  outputToken,
  action,
  inputTokenBalance,
  outputTokenBalance,
  effectivePrice,
  realtimePrice,
  t,
  language,
}: UseLimitOrderUIStateParams): UseLimitOrderUIStateResult {
  // 订单价格偏离度, 超过+20%则提示用户确认价格
  const isOrderPriceDeviation = useMemo(() => {
    const referencePrice = new BigNumber(realtimePrice || 0)
    const targetPrice = new BigNumber(effectivePrice || 0)

    if (!referencePrice.isFinite() || referencePrice.lte(0)) return false
    if (!targetPrice.isFinite() || targetPrice.lte(0)) return false

    const upperBound = referencePrice.multipliedBy(1.2)
    const lowerBound = referencePrice.multipliedBy(0.8)

    return targetPrice.gte(upperBound) || targetPrice.lte(lowerBound)
  }, [effectivePrice, realtimePrice])

  /**
   * 是否低于最小金额
   */
  const isMin = useMemo(() => {
    return isLess(orderValue, inputToken?.minLimitTradeAmount || "0")
  }, [orderValue, inputToken])

  /**
   * 是否超过最大金额
   */
  const isMax = useMemo(() => {
    return isGreater(orderValue, inputToken?.maxLimitTradeAmount || "0")
  }, [orderValue, inputToken])

  /**
   * 买单余额不足
   */
  const isBuyInsufficient = useMemo(() => {
    if (action !== "buy") return false

    return isGreater(
      orderValue,
      outputTokenBalance?.balance || "0"
    )
  }, [orderValue, outputTokenBalance, action])

  /**
   * 卖单余额不足
   */
  const isSellInsufficient = useMemo(() => {
    if (action !== "sell") return false

    return isGreater(
      inputSize,
      inputTokenBalance?.balance || "0"
    )
  }, [inputSize, inputTokenBalance, action])

  /**
   * 当前token仅支付卖出，
   */
  const isSellOnly = useMemo(() => {
    return inputToken?.state === RWA_STATUS.SELL && action === "buy"
  }, [inputToken, action])

  /**
   * 按钮是否禁用
   */
  const disabled = useMemo(() => {
    return (
      Number(orderValue) <= 0 ||
      isOrderPriceDeviation ||
      isMin ||
      isMax ||
      isBuyInsufficient ||
      isSellInsufficient ||
      isSellOnly
    )
  }, [
    orderValue,
    isMin,
    isMax,
    isOrderPriceDeviation,
    isBuyInsufficient,
    isSellInsufficient,
    isSellOnly,
  ])

  /**
   * 按钮文案
   */
  const buttonText = useMemo(() => {
    if (Number(limitPrice) <= 0) return t("Enter Limit Price")
    if (Number(orderValue) <= 0) return t("Enter an amount")

    if (inputToken?.state === 1) return t("tradingHalt")

    if (isOrderPriceDeviation) {
      return t("v3.t37")
    }

    if (isMin)
      return t("amountMin", {
        amount:
          inputToken?.minLimitTradeAmount +
          " " +
          outputToken?.symbol,
      })

    if (isMax)
      return t("amountMax", {
        amount:
          inputToken?.maxLimitTradeAmount +
          " " +
          outputToken?.symbol,
      })

    if (isBuyInsufficient) {
      return language === "zh"
        ? `${outputToken?.symbol} ${t("Insufficient")}`
        : `${t("Insufficient")} ${outputToken?.symbol}`
    }

    if (isSellInsufficient) {
      return language === "zh"
        ? `${inputToken?.symbol} ${t("Insufficient")}`
        : `${t("Insufficient")} ${inputToken?.symbol}`
    }

    return `${action === "buy" ? t("Buy") : t("Sell")} ${
      inputToken?.symbol
    }`
  }, [
    limitPrice,
    orderValue,
    inputToken,
    outputToken,
    isMin,
    isMax,
    isBuyInsufficient,
    isSellInsufficient,
    action,
    t,
    language,
    isOrderPriceDeviation,
  ])

  return {
    disabled,
    buttonText,
    isBuyInsufficient,
    isSellInsufficient,
    isMin,
    isMax,
  }
}
