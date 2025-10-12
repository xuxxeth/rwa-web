import { CurrencyInputPanel } from "@/components/input/CurrencyInputPanel";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EstimatedInfo } from "../../views/lite-trade/components/EstimatedInfo";
import { cn } from "@/lib/utils";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { ConnectButtonText } from "@/components/button/ConnectButtonText";
import BigNumber from "bignumber.js";
import { compareBigNumber, isGreater, isLess, multiply, parseAmount } from "@/utils";
import { useShowDialog, DialogController } from '@/components/dialog/DialogController'
import { useTrading } from "@/hooks/useCaCommon";
import { ExpiresSetting } from "../expires-setting";
import { useTradeStore } from "@/stores/tradeStore";
import wsService from "@/service/WebSocketService";
import { useBaseStore } from "@/stores/baseStore";
import { useToast } from "@/hooks/useToast";

const trading = '0xe3ec160b8c5e0DeCFd254AB59740b92A2E840Fe9'

type ConverBodyProps = {
  action?: string
  from?: string
}

export function ConverBody({
  action = 'buy',
  from
}: ConverBodyProps) {
  const { t } = useTranslation()
  const { toastError } = useToast()
  const marketInfo = useBaseStore(state => state.marketInfo)
  const freshTokenBalances = useBaseStore(state => state.freshTokenBalances)
  const updateLimitPrice = useTradeStore(state => state.updateLimitPrice)
  const updateInputSize = useTradeStore(state => state.updateInputSize)
  const updateExpires = useTradeStore(state => state.updateExpires)
  const limitPrice = useTradeStore(state => state.limitPrice)
  const inputSize = useTradeStore(state => state.inputSize)
  const expires = useTradeStore(state => state.expires)
  const inputToken = useTradeStore(state => state.inputToken)
  const outputToken = useTradeStore(state => state.outputToken)

  const { account } = useActiveWeb3()
  const expiresDialog = useShowDialog()
  const [orderValue, setOrderValue] = useState('')
  const paymentToken = useMemo(() => action === 'buy' ? outputToken?.address : inputToken?.address, [action, inputToken, outputToken])

  const approveAmount = useMemo(() => {
    return multiply(orderValue, inputToken?.price ?? '0')
  }, [orderValue, inputToken])

  console.log('orderValue: ', orderValue, approveAmount)

  const { placeOrder, approvalState, allowance } = useTrading(paymentToken as `0x${string}`, trading, BigInt(parseAmount(approveAmount)))
  console.log(approvalState, allowance)
  const hanleInputPrice = useCallback(async (value: string) => {
    updateLimitPrice(value)
  }, [])
  const hanleInputQuantity = useCallback(async (value: string) => {
    updateInputSize(value)
  }, [])

  const handleSubscribe = (data: any) => {
  }

  useEffect(() => {
    wsService.init({})

    wsService.subscribe(["summary"], handleSubscribe)
    return () => {
      wsService.unsubscribe(["summary"], handleSubscribe)
    }
  }, [])
  
  useEffect(() => {
    if (Number(limitPrice) && Number(inputSize)) {
      const result = new BigNumber(limitPrice)
        .multipliedBy(inputSize)
        .decimalPlaces(6, BigNumber.ROUND_DOWN) // 保留 6 位小数，向下取整
      setOrderValue(result.toFixed())
    } else {
      setOrderValue('')
    }
    
  }, [limitPrice, inputSize])

  const [buying, setBuying] = useState(false)

  const handlePlaceOrder = useCallback(async () => {
    const params = {
      stockId: String(inputToken?.stockId),
      tradeType: '0',
      side: action === 'buy' ? '0' : '1',
      tif: '1',
      sessionType: '0',
      paymentToken: outputToken?.address || '', // address
      validDate: String(expires), // D
      // networkFee: parseAmount(marketInfo.networkFeeInNative, 18), // 0.002
      networkFee: '0', // 0.002
      amount: '0', // 10 usdt
      price: parseAmount(limitPrice),   // 1 usdt
      size: parseAmount(inputSize)    // 10
    }
    console.log(params)
    setBuying(true)
    const result = await placeOrder(params, {value: parseAmount(marketInfo.networkFeeInNative, 19), wait: true})
    setBuying(false)
    console.log(result)
    if (result && result?.code === -1) {
      toastError({title: typeof result?.message === 'string' ? result.message : result.message?.name || ''})
    } else {
      freshTokenBalances()
    }
 
  }, [limitPrice, inputSize, expires, action, paymentToken, inputToken, outputToken, marketInfo, placeOrder, freshTokenBalances])

  const buttonVariant = useMemo(() => (action === 'buy' ? 'primary' : 'warning'), [action])
  const actionText = useMemo(() => (action === 'buy' ? t('Buy') : t('Sell')), [action, t])
  const isInsufficient = useMemo(() => orderValue ? (isGreater(orderValue, outputToken?.balance || '0')) : false, [orderValue, outputToken])

  const disabled = useMemo(() => Number(orderValue) <= 0 || !!isInsufficient, [orderValue, isInsufficient])

  const buttonText = useMemo(() => {
    if (Number(orderValue) <= 0) return t('Enter an amount')
    if (isInsufficient) return t("Insufficient USDT")
    
    return (actionText + ` ${inputToken?.symbol}`)

  }, [t, actionText, buying, disabled, inputToken, orderValue, isInsufficient])

  return (
    <div className="mt-4">
      <CurrencyInputPanel
        from={from}
        mode="price"
        label={t('Limit price')}
        onUserInput={hanleInputPrice}
      />
      <div className="h-2"></div>
      <CurrencyInputPanel 
        regex="^\d*$"
        from={from}
        label={t('Quantity')}
        placeholder={t('Whole shares only')}
        onUserInput={hanleInputQuantity}
      />
      <div className="h-2"></div>
      <CurrencyInputPanel
        from={from}
        mode="out"
        label={t('Order Value')}
        value={orderValue}
        isInsufficient={isInsufficient}
      />
      <EstimatedInfo
        marketInfo={marketInfo}
        inputToken={inputToken}
        outputToken={outputToken}
        expires={expires}
        onEdit={() => {
        expiresDialog.show()
      }} />
      {
        !account ? <ConnectButtonText /> :
        <Button variant={buttonVariant} 
          loading={buying}
          className={cn(
            "w-full mt-8",
            from === 'markets' ? 'h-[52px]' : ''
          )}
          disabled={disabled || buying}
          onClick={() => handlePlaceOrder()}
        >
          { buttonText }
          
        </Button>
      }
      <DialogController
        title={t("Expires in")}
        open={expiresDialog.open}
        openChange={expiresDialog.setOpen}
      > 
        <ExpiresSetting onConfirm={value => {
          updateExpires(value)
          expiresDialog.hide()
        } } />
      </DialogController>
    </div>
  )
}