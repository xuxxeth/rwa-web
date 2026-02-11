// hooks/useLimitOrder.ts

import { useState, useCallback } from "react"
import { TradeType, SideType, TifType, SessionType } from "@/hooks/useCaCommon"
import { parseAmount, truncateUP } from "@/utils"

export function useLimitOrder({
  placeOrder,
  inputToken,
  outputToken,
  limitPrice,
  inputSize,
  expires,
  action,
  marketInfo,
  riskUserConfig,
  t,
  toastError
}: any) {

  const [loading, setLoading] = useState(false)

  const validateRisk = useCallback(() => {
    if (riskUserConfig?.actions === 0) {
      toastError({ title: t('v2.tx.t39') })
      return false
    }
    if (riskUserConfig?.actions === 1 && action === 'sell') {
      toastError({ title: t('v2.tx.t41') })
      return false
    }
    if (riskUserConfig?.actions === 2 && action === 'buy') {
      toastError({ title: t('v2.tx.t40') })
      return false
    }
    return true
  }, [riskUserConfig, action, t, toastError])

  const submit = useCallback(async () => {
    if (!validateRisk()) return

    setLoading(true)

    try {
      const params = {
        stockId: String(inputToken?.stockId),
        tradeType: TradeType.LIMIT,
        side: action === 'buy'
          ? SideType.BUYLIMIT
          : SideType.SELL,
        tif: TifType.DAY,
        sessionType: SessionType.DEFAULT,
        paymentToken: outputToken?.address || '',
        validDate: String(expires),
        networkFee: '0',
        amount: '0',
        price: parseAmount(truncateUP(limitPrice, 2)),
        size: parseAmount(inputSize)
      }

      await placeOrder(params, {
        value: parseAmount(marketInfo.networkFeeInNative, 18),
        wait: true,
        skipSimulate: true
      })
    } finally {
      setLoading(false)
    }

  }, [
    inputToken,
    outputToken,
    limitPrice,
    inputSize,
    expires,
    action,
    marketInfo,
    validateRisk,
    placeOrder
  ])

  return {
    submit,
    loading
  }
}
