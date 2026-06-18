// hooks/useLimitOrderUIState.ts

import { useMemo } from "react"
import BigNumber from "bignumber.js"
import { isGreater, isLess } from "@/utils"
import type { IMarket, IRwa, IToken } from "@/service/base/types"
import type { TFunction } from "i18next"
import { MARKET_STATUS, RWA_STATUS } from "@/config/constants"
import { useSessionState } from "@/hooks/useMarketState"
import { TradeType } from "@/hooks/useCaCommon"

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
  tradeType: number

  inputToken?: IRwa | null
  outputToken?: IToken | null

  action: "buy" | "sell"

  inputTokenBalance?: TokenBalance | null
  outputTokenBalance?: TokenBalance | null

  effectivePrice: string
  realtimePrice?: string

  t: TFunction
  language: string
  marketTradeState: number
  marketInfo: IMarket | null
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
  tradeType,
  inputToken,
  outputToken,
  action,
  inputTokenBalance,
  outputTokenBalance,
  effectivePrice,
  realtimePrice,
  t,
  language,
  marketTradeState,
  marketInfo
}: UseLimitOrderUIStateParams): UseLimitOrderUIStateResult {
  // wss过来的L和M交易状态, 整个市场变更
  const sessionDisabled = useSessionState(tradeType)
  
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
    return isLess(orderValue, marketInfo?.minAmountPerOrder || "0")
  }, [orderValue, marketInfo])

  /**
   * 是否超过最大金额
   */
  const isMax = useMemo(() => {
    return isGreater(orderValue, marketInfo?.maxAmountPerOrder || "0")
  }, [orderValue, marketInfo])

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
   * 交易暂停
    */
  const isTradingHalt = useMemo(() => {
    return inputToken?.state === RWA_STATUS.HALT
  }, [inputToken])

  // 要不要在这里根据inputToken的session，把按钮禁掉，因为市价交易没有禁掉, 这里只控制市价交易的按钮，限制交易选择时段下拉框控制
  /**
   * 不支持盘前盘后交易
   */
  const notSupportBeforeOrAfter = useMemo(() => {
    if (!inputToken) return true
    if ((inputToken.sessionMaskList?.[1] === 0 && marketTradeState === MARKET_STATUS.AFTER) || 
      (inputToken.sessionMaskList?.[2] === 0 && marketTradeState === MARKET_STATUS.BEFORE)) {
        if (tradeType === TradeType.MARKET) {
          return true
        }
        return false
    }
    return false
  }, [inputToken, marketTradeState, tradeType])
  /**
   * 不支持夜盘交易
   */
  const notSupportOvernight = useMemo(() => {
    if (!inputToken) return true
    if (inputToken.sessionMaskList?.[0] === 0 && marketTradeState === MARKET_STATUS.OVERNIGHT) {
      
      if (tradeType === TradeType.MARKET) {
        return true
      }
      return false
    }
    return false
  }, [inputToken, marketTradeState, tradeType])

  // console.log('isOrderPriceDeviation: ', isOrderPriceDeviation)
  // console.log('isMin: ', isMin)
  // console.log('isMax: ', isMax)
  // console.log('isBuyInsufficient: ', isBuyInsufficient)
  // console.log('isSellInsufficient: ', isSellInsufficient)
  // console.log('isSellOnly: ', isSellOnly)
  // console.log('isTradingHalt: ', isTradingHalt)
  // console.log('sessionDisabled: ', sessionDisabled)
  // console.log('notSupportBeforeOrAfter: ', notSupportBeforeOrAfter)
  // console.log('notSupportOvernight: ', notSupportOvernight)
  // console.log('---------------------------------------------------')
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
      isSellOnly ||
      isTradingHalt ||
      sessionDisabled ||
      notSupportBeforeOrAfter ||
      notSupportOvernight
    )
  }, [
    orderValue,
    isMin,
    isMax,
    isOrderPriceDeviation,
    isBuyInsufficient,
    isSellInsufficient,
    isSellOnly,
    isTradingHalt,
    sessionDisabled,
    notSupportBeforeOrAfter,
    notSupportOvernight
  ])

  /**
   * 按钮文案
   */
  const buttonText = useMemo(() => {
    if (inputToken?.state === 1) return t("tradingHalt")
    if (inputToken?.state === RWA_STATUS.SELL && action === "buy") return t("marketQuotes.buyForbidden")
    if (Number(limitPrice) <= 0) return t("Enter Limit Price")
    if (Number(orderValue) <= 0) return t("Enter an amount")

    if (isOrderPriceDeviation) {
      return t("v3.t37")
    }

    if (isMin)
      return t("amountMin", {
        amount:
          (marketInfo?.minAmountPerOrder || "0") +
          " " +
          outputToken?.symbol,
      })

    if (isMax)
      return t("amountMax", {
        amount:
          (marketInfo?.maxAmountPerOrder || "0") +
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
    marketInfo,
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
