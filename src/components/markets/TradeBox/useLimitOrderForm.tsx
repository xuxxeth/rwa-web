// hooks/useLimitOrderForm.ts

import { useMemo } from "react"
import BigNumber from "bignumber.js"
import {
  isGreater,
  isLess,
} from "@/utils"
import type { IRwa, IToken } from "@/service/base/types"
import type { TFunction } from "i18next"

type TokenBalance = {
  balance?: string
}

interface UseLimitOrderFormParams {
  limitPrice: string
  inputSize: string
  inputToken?: IRwa | null
  outputToken?: IToken | null
  action: "buy" | "sell"
  inputTokenBalance?: TokenBalance | null
  outputTokenBalance?: TokenBalance | null
  t: TFunction
  i18n: {
    language: string
  }
}

export function useLimitOrderForm({
  limitPrice,
  inputSize,
  inputToken,
  outputToken,
  action,
  inputTokenBalance,
  outputTokenBalance,
  t,
  i18n
}: UseLimitOrderFormParams) {

  const orderValue = useMemo(() => {
    if (!Number(limitPrice) || !Number(inputSize)) return ''
    return new BigNumber(limitPrice)
      .multipliedBy(inputSize)
      .decimalPlaces(6, BigNumber.ROUND_DOWN)
      .toFixed()
  }, [limitPrice, inputSize])

  const isMinOrMax = useMemo(() => ({
    min: isLess(orderValue, inputToken?.minLimitTradeAmount || '0'),
    max: isGreater(orderValue, inputToken?.maxLimitTradeAmount || '0')
  }), [orderValue, inputToken])

  const isBuyInsufficient = useMemo(() => {
    if (action !== 'buy') return false
    return isGreater(orderValue, outputTokenBalance?.balance || '0')
  }, [orderValue, outputTokenBalance, action])

  const isSellInsufficient = useMemo(() => {
    if (action !== 'sell') return false
    return isGreater(inputSize, inputTokenBalance?.balance || '0')
  }, [inputSize, inputTokenBalance, action])

  const disabled = useMemo(() => {
    return (
      Number(orderValue) <= 0 ||
      isBuyInsufficient ||
      isSellInsufficient ||
      isMinOrMax.min ||
      isMinOrMax.max ||
      inputToken?.state === 1
    )
  }, [
    orderValue,
    isBuyInsufficient,
    isSellInsufficient,
    isMinOrMax,
    inputToken
  ])

  const buttonText = useMemo(() => {
    if (Number(limitPrice) <= 0) return t('Enter Limit Price')
    if (Number(orderValue) <= 0) return t('Enter an amount')
    if (inputToken?.state === 1) return t('tradingHalt')
    if (isMinOrMax.min) return t('amountMin', { amount: inputToken?.minLimitTradeAmount + ' ' + outputToken?.symbol })
    if (isMinOrMax.max) return t('amountMax', { amount: inputToken?.maxLimitTradeAmount + ' ' + outputToken?.symbol })
    if (isBuyInsufficient)
      return i18n.language === 'zh'
        ? `${outputToken?.symbol} ${t("Insufficient")}`
        : `${t("Insufficient")} ${outputToken?.symbol}`
    if (isSellInsufficient)
      return i18n.language === 'zh'
        ? `${inputToken?.symbol} ${t("Insufficient")}`
        : `${t("Insufficient")} ${inputToken?.symbol}`

    return `${action === 'buy' ? t('Buy') : t('Sell')} ${inputToken?.symbol}`
  }, [
    limitPrice,
    orderValue,
    inputToken,
    isMinOrMax,
    isBuyInsufficient,
    isSellInsufficient,
    action,
    t,
    i18n.language
  ])

  return {
    orderValue,
    disabled,
    buttonText,
    isBuyInsufficient,
    isSellInsufficient,
  }
}
