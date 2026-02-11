import { useTranslation } from "@/hooks/useTranslation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import BigNumber from "bignumber.js";
import { isGreater, isLess, parseAmount, truncateUP } from "@/utils";
import { useTradeStore } from "@/stores/tradeStore";
import { useBaseStore } from "@/stores/baseStore";
import { useToast } from "@/hooks/useToast";
import { useTokenBalance } from "@/hooks/useTokenBalances";
import { useSignatureValidStatus } from "@/hooks/useSignature";
import { useRiskStatus } from "@/hooks/useRiskStatus";
import { useTrading } from "@/hooks/useTrading";
import { SessionType, SideType, TifType, TradeType } from "@/hooks/useCaCommon";
import type { IRwa, ITokenWithPrice } from "@/service/base/types";
import { useTxToast } from "@/hooks/useTxToast";
import { useCalcFee } from "@/hooks/useCalcFee";
import { useSettingStore } from "@/stores/settingStore";
import { useKycStore } from "@/stores/kycStore";
import { useRealtimeRwa } from "@/hooks/useRealtimeRwa";
import { RISK_STATUS } from "@/config/constants";
import { useTradePageReady } from "@/hooks/useTradePageReady";
import { cn } from "@/lib/utils";
import { TradeFormUI } from "./TradeFormUI";
import { TradeButtonUI } from "./TradeButtonUI";
import { MarketCloseTip } from "../MarketCloseTip";

type ConverBodyProps = {
  action?: string
  from?: string
}

export function ConverBody({
  from
}: ConverBodyProps) {
  const { t, i18n } = useTranslation()
  const { toastError } = useToast()
  const marketInfo = useBaseStore(state => state.marketInfo)
  const riskUserConfig = useKycStore(state => state.riskUserConfig)
  const freshTokenBalances = useBaseStore(state => state.freshTokenBalances)
  const updateLimitPrice = useTradeStore(state => state.updateLimitPrice)
  const updateInputSize = useTradeStore(state => state.updateInputSize)
  const updateExpires = useTradeStore(state => state.updateExpires)
  const setTxError = useTradeStore(state => state.setTxError)
  const setTxSuccess = useTradeStore(state => state.setTxSuccess)
  const limitPrice = useTradeStore(state => state.limitPrice)
  const inputSize = useTradeStore(state => state.inputSize)
  const expires = useTradeStore(state => state.expires)
  const inputToken = useTradeStore(state => state.inputToken)
  const outputToken = useTradeStore(state => state.outputToken)
  const showConfirm = useSettingStore(state => state.showConfirm)
  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()
  const { riskStatus } = useRiskStatus()
  const action = useTradeStore(state => state.activeConvertTab)
  const { account, isSameChain } = useActiveWeb3()
  const [orderValue, setOrderValue] = useState('')

  const paymentToken = useMemo(() => action === 'buy' ? outputToken?.address : inputToken?.address, [action, inputToken?.address, outputToken?.address])

  const rwaPrice = useTokenBalance(inputToken?.symbol || '')
  const realtimeData = useTradeStore(state => state.realtimeRwaData)
  const initPrice = useRef(false)
  const [inputTokenPrice, setInputTokenPrice] = useState<ITokenWithPrice | null>(null)

  useEffect(() => {
    if (rwaPrice && realtimeData && !initPrice.current) {
      initPrice.current = true
      setInputTokenPrice({...rwaPrice, price: String(realtimeData.p)})
    }
  }, [rwaPrice, realtimeData])

  const preToken = useRef<IRwa | null>(null)
  useEffect(() => {
    if (inputToken && realtimeData && preToken.current?.symbol !== inputToken?.symbol) {
      preToken.current = inputToken
      setInputTokenPrice({...rwaPrice, price: String(realtimeData.p)})
    }
  }, [inputToken, rwaPrice, realtimeData])

  const { estimatedFee, platformFee, brokerageFee, tradingActivityFee, allOrderValue } = useCalcFee(orderValue, inputSize, action === 'buy', inputToken?.feeRate)

  const approveAmount = useMemo(() => {
    return action === 'buy' ?
      (orderValue ? parseAmount(parseFloat(orderValue) + parseFloat(estimatedFee), outputToken?.decimals) : '0') :
      (inputSize ? parseAmount(inputSize, inputToken?.decimals) : '0')
  }, [orderValue, inputSize, outputToken, inputToken, action, estimatedFee])

  const { toastTxSteps, dismissTxToast } = useTxToast()
  const setTxStep = useTradeStore(state => state.setTxStep)

  const { placeOrder, txStep, approvalState, refetchAllowance } = useTrading(paymentToken as `0x${string}`, BigInt(approveAmount))
  const stepStartRef = useRef(false)

  useEffect(() => {
    if (stepStartRef.current) {
      setTxStep(txStep)
    }
  }, [txStep, setTxStep])

  const handleStartStep = useCallback(() => {
    stepStartRef.current = true
    dismissTxToast()
    setTxError('')
    setTxSuccess('', '', '')
    setTxStep(approvalState === 3 ? 1 : 0)
  }, [setTxStep, approvalState, dismissTxToast, setTxError, setTxSuccess])

  const handleEndStep = useCallback(() => {
    dismissTxToast()
    setTxError('')
    setTxSuccess('', '', '')
    setTimeout(() => {
      stepStartRef.current = false
      setTxStep(approvalState === 3 ? 1 : 0)
      refetchAllowance()
    }, 500)
  }, [setTxStep, approvalState, refetchAllowance, dismissTxToast, setTxError, setTxSuccess])

  const hanleInputPrice = useCallback((value: string) => {
    updateLimitPrice(value)
  }, [updateLimitPrice])

  const hanleInputQuantity = useCallback((value: string) => {
    updateInputSize(value)
  }, [updateInputSize])

  useEffect(() => {
    updateInputSize('')
  }, [action, updateInputSize])

  useEffect(() => {
    if (inputTokenPrice) {
      updateLimitPrice(truncateUP(inputTokenPrice?.price ?? '0', 2))
    }
  }, [inputToken, inputTokenPrice, updateLimitPrice])

  useEffect(() => {
    if (Number(limitPrice) && Number(inputSize)) {
      const result = new BigNumber(limitPrice)
        .multipliedBy(inputSize)
        .decimalPlaces(6, BigNumber.ROUND_DOWN)
      setOrderValue(result.toFixed())
    } else {
      setOrderValue('')
    }
  }, [limitPrice, inputSize])

  const [buying, setBuying] = useState(false)

  const handlePlaceOrder = useCallback(async () => {
    if (riskUserConfig?.actions === 0) {
      toastError({title: t('v2.tx.t39')})
      return
    }
    if (riskUserConfig?.actions === 1 && action === 'sell') {
      toastError({title: t('v2.tx.t41')})
      return
    }
    if (riskUserConfig?.actions === 2 && action === 'buy') {
      toastError({title: t('v2.tx.t40')})
      return
    }

    const params = {
      stockId: String(inputToken?.stockId),
      tradeType: TradeType.LIMIT,
      side: action === 'buy' ? SideType.BUYLIMIT : SideType.SELL,
      tif: TifType.DAY,
      sessionType: SessionType.DEFAULT,
      paymentToken: outputToken?.address || '',
      validDate: String(expires),
      networkFee: '0',
      amount: '0',
      price: parseAmount(truncateUP(limitPrice, 2)),
      size: parseAmount(inputSize)
    }

    setBuying(true)
    handleStartStep()
    toastTxSteps({action: 'place', approveed: approvalState === 3, onClick: handleEndStep})

    try {
      const result = await placeOrder(params, {
        value: parseAmount(marketInfo.networkFeeInNative, 18),
        wait: true,
        skipSimulate: true
      })

      if (result && result?.code === 9200) {
        freshTokenBalances()
        updateInputSize('')
      } else {
        // @ts-ignore
        const errorMessage = result?.data?.message
        const txMessage = errorMessage ? t(`appErr.${errorMessage}`) : t('appErr.placeOrderFail')
        setTxError(txMessage)
      }
    } catch {
      setTxError(t('appErr.placeOrderFail'))
    } finally {
      setBuying(false)
    }
  }, [
    approvalState,
    limitPrice,
    inputSize,
    expires,
    action,
    inputToken,
    outputToken,
    marketInfo,
    riskUserConfig,
    placeOrder,
    freshTokenBalances,
    handleStartStep,
    handleEndStep,
    updateInputSize,
    toastTxSteps,
    setTxError,
    t,
    toastError,
  ])

  const buttonVariant = useMemo(() => (action === 'buy' ? 'primary' : 'warning'), [action])
  const actionText = useMemo(() => (action === 'buy' ? t('Buy') : t('Sell')), [action, t])
  const inputTokenBalance = useTokenBalance(inputToken?.symbol || '')
  const outputTokenBalance = useTokenBalance(outputToken?.symbol || '')

  const isMinOrMax = useMemo(() => {
    return {
      min: isLess(orderValue, inputToken?.minLimitTradeAmount || '0'),
      max: isGreater(orderValue, inputToken?.maxLimitTradeAmount || '0')
    }
  }, [inputToken, orderValue])

  const isInsufficient = useMemo(
    () => action === 'buy' && orderValue ? isGreater(orderValue, outputTokenBalance?.balance || '0') : false,
    [orderValue, outputTokenBalance, action]
  )

  const isSellInsufficient = useMemo(
    () => action === 'sell' && inputSize ? isGreater(inputSize, inputTokenBalance?.balance || '0') : false,
    [inputSize, inputTokenBalance, action]
  )

  const disabled = useMemo(
    () => Number(orderValue) <= 0 ||
      (action === 'buy' ? !!isInsufficient : !!isSellInsufficient) ||
      isMinOrMax.min || isMinOrMax.max ||
      inputToken?.state === 1,
    [orderValue, isInsufficient, isSellInsufficient, isMinOrMax, inputToken, action]
  )

  const kycButtonText = useMemo(() => {
    let text = ''
    if (riskStatus !== RISK_STATUS.VERIFIED && riskStatus !== RISK_STATUS.DEFAULT) {
      text = t('identity.verifyID')
    }
    return text
  }, [t, riskStatus])

  const buttonText = useMemo(() => {
    if (Number(limitPrice) <= 0) return t('Enter Limit Price')
    if (Number(orderValue) <= 0) return t('Enter an amount')
    if (inputToken?.state === 1) return t('tradingHalt')
    if (isMinOrMax.min) return t('amountMin', { amount: inputToken?.minLimitTradeAmount + ' ' + outputToken?.symbol })
    if (isMinOrMax.max) return t('amountMax', { amount: inputToken?.maxLimitTradeAmount + ' ' + outputToken?.symbol })
    if (isInsufficient) return i18n.language === 'zh' ? outputToken?.symbol + ' ' + t("Insufficient") : t("Insufficient") + ' ' + outputToken?.symbol
    if (isSellInsufficient) return i18n.language === 'zh' ? inputToken?.symbol + ' ' + t("Insufficient") : t("Insufficient") + ' ' + inputToken?.symbol
    return actionText + ` ${inputToken?.symbol}`
  }, [t, limitPrice, actionText, inputToken, outputToken, orderValue, isInsufficient, isSellInsufficient, isMinOrMax, i18n.language])

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
      updateLimitPrice(newPrice)
    } else if (value === 0) {
      if (inputTokenPrice) {
        updateLimitPrice(truncateUP(inputTokenPrice?.price ?? '0', 2))
      }
    }
  }, [inputTokenPrice, updateLimitPrice])

  useRealtimeRwa(inputToken)

  useEffect(() => {
    if (inputToken?.symbol && initPrice.current) {
      initPrice.current = false
    }
  }, [inputToken])

  const isPageReady = useTradePageReady({
    account,
    isSameChain,
    inputToken,
    outputToken,
    inputTokenBalance,
    outputTokenBalance,
    approvalState,
    riskStatus,
    isSignatureValid
  })

  return (
    <div className={cn(
      "mt-2",
      from === 'lite-trade' ? 'mt-0' : ''
    )}>
      <TradeFormUI
        from={from}
        action={action as "buy" | "sell"}
        limitPrice={limitPrice}
        inputSize={inputSize}
        orderValue={orderValue}
        allOrderValue={allOrderValue}
        isInsufficient={isInsufficient}
        isSellInsufficient={isSellInsufficient}
        account={account}
        inputTokenSymbol={inputToken?.symbol}
        outputTokenSymbol={outputToken?.symbol}
        inputTokenBalance={inputTokenBalance?.balance}
        outputTokenBalance={outputTokenBalance?.balance}
        estimatedFee={estimatedFee}
        networkFeeInNative={marketInfo.networkFeeInNative}
        expires={expires}
        onPriceChange={hanleInputPrice}
        onSizeChange={hanleInputQuantity}
        onChangePriceType={handleChangePrice}
        onExpiresChange={(value) => {
          updateExpires(value)
        }}
      />

      <TradeButtonUI
        from={from}
        account={account}
        isSameChain={isSameChain}
        isSignatureValid={isSignatureValid}
        refreshIsSignatureValid={refreshIsSignatureValid}
        isPageReady={isPageReady}
        kycButtonText={kycButtonText}
        buttonVariant={buttonVariant}
        action={action as "buy" | "sell"}
        buying={buying}
        disabled={disabled}
        buttonText={buttonText}
        showConfirm={showConfirm}
        onSubmit={handlePlaceOrder}
        orderValue={orderValue}
        platformFee={platformFee}
        brokerageFee={brokerageFee}
        tradingActivityFee={tradingActivityFee}
        estimatedFee={estimatedFee}
        feeRate={inputToken?.feeRate ?? ''}
        networkFeeInNative={marketInfo.networkFeeInNative}
      />
      <MarketCloseTip />
    </div>
  )
}
