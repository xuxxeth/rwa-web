// hooks/useLimitOrder.ts

import { useState, useCallback } from "react"
import { TradeType, SideType, TifType, SessionType } from "@/hooks/useCaCommon"
import { parseAmount, truncateUP } from "@/utils"
import type { IRwa, IToken } from "@/service/base/types"
import type { TFunction } from "i18next"

type PlaceOrderFn = (params: any, options?: any) => Promise<any>
type ToastErrorFn = (payload: { title: string }) => void

interface UseLimitOrderParams {
  placeOrder: PlaceOrderFn
  inputToken?: IRwa | null
  outputToken?: IToken | null
  limitPrice: string
  inputSize: string
  expires: string | number
  action: "buy" | "sell"
  marketInfo: {
    networkFeeInNative: string
  }
  riskUserConfig?: {
    actions?: number
  } | null
  t: TFunction
  toastError: ToastErrorFn
  onStart?: () => void
  onSuccess?: (result: any) => void
  onError?: (message: string, result?: any) => void
  onFinally?: () => void
}

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
  toastError,
  onStart,
  onSuccess,
  onError,
  onFinally,
}: UseLimitOrderParams) {

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
    onStart?.()

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

      const result = await placeOrder(params, {
        value: parseAmount(marketInfo.networkFeeInNative, 18),
        wait: true,
        skipSimulate: true
      })

      if (result?.code === 9200) {
        onSuccess?.(result)
      } else {
        // @ts-ignore
        const errorMessage = result?.data?.message
        const txMessage = errorMessage ? t(`appErr.${errorMessage}`) : t('appErr.placeOrderFail')
        onError?.(txMessage, result)
      }
    } catch {
      onError?.(t('appErr.placeOrderFail'))
    } finally {
      setLoading(false)
      onFinally?.()
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
    placeOrder,
    onStart,
    onSuccess,
    onError,
    onFinally,
    t,
  ])

  return {
    submit,
    loading
  }
}
