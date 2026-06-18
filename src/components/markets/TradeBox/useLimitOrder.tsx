// hooks/useLimitOrder.ts

import { useState, useCallback } from "react"
import BigNumber from "bignumber.js"
import { TradeType, SideType, TifType, SessionType } from "@/hooks/useCaCommon"
import { hasPermission, parseAmount } from "@/utils"
import type { IRwa, IToken } from "@/service/base/types"
import type { TFunction } from "i18next"
import { zeroAddress } from "@/config/constants"

type PlaceOrderFn = (params: any, options?: any) => Promise<any>
type ToastErrorFn = (payload: { title: string }) => void

interface UseLimitOrderParams {
  placeOrder: PlaceOrderFn
  inputToken?: IRwa | null
  outputToken?: IToken | null
  effectivePrice: string
  inputSize: string
  expires: string | number
  action: "buy" | "sell",
  tradeType: TradeType,
  sessionType: SessionType,
  slippage: number,
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
  effectivePrice,
  inputSize,
  expires,
  action,
  tradeType,
  sessionType,
  slippage,
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
    if (!hasPermission(riskUserConfig?.actions || 0, 1) && action === 'sell') {
      toastError({ title: t('v2.tx.t41') })
      return false
    }
    if (!hasPermission(riskUserConfig?.actions || 0, 0) && action === 'buy') {
      toastError({ title: t('v2.tx.t40') })
      return false
    }
    return true
  }, [riskUserConfig, action, t, toastError])

  const getOrderPrice = useCallback(() => {
    // if (tradeType === TradeType.MARKET && (!Number.isInteger(slippage) || slippage < 0.1 || slippage > 3)) {
    //   toastError({ title: "Slippage must be an integer between 1 and 5." })
    //   return null
    // }

    const finalPrice = new BigNumber(effectivePrice || 0)
    if (!finalPrice.isFinite() || finalPrice.lte(0)) {
      toastError({ title: "Invalid price. Please try again later." })
      return null
    }
    return finalPrice.decimalPlaces(2, BigNumber.ROUND_DOWN).toFixed(2)
  }, [tradeType, slippage, effectivePrice, toastError])

  const submit = useCallback(async () => {
    if (!validateRisk()) return

    try {
      const orderPrice = getOrderPrice()
      if (!orderPrice) {
        return
      }

      setLoading(true)
      onStart?.()

      const params = {
        stockId: String(inputToken?.stockId),
        tradeType: tradeType,
        side: action === 'buy'
          ? SideType.BUYLIMIT
          : SideType.SELL,
        tif: TifType.DAY,
        sessionType: sessionType,
        paymentToken: outputToken?.address || '',
        validDate: String(expires),
        networkFee: '0',
        amount: '0',
        price: parseAmount(orderPrice),
        size: parseAmount(inputSize),
        clientAddress: zeroAddress
      }
      console.log('place order params', params)
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
    effectivePrice,
    inputSize,
    expires,
    action,
    tradeType,
    sessionType,
    slippage,
    marketInfo,
    getOrderPrice,
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
