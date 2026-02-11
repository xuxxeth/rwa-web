import { useTranslation } from "@/hooks/useTranslation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import BigNumber from "bignumber.js";
import { parseAmount, truncateUP } from "@/utils";
import { useTradeStore } from "@/stores/tradeStore";
import { useBaseStore } from "@/stores/baseStore";
import { useToast } from "@/hooks/useToast";
import { useTokenBalance } from "@/hooks/useTokenBalances";
import { useSignatureValidStatus } from "@/hooks/useSignature";
import { useRiskStatus } from "@/hooks/useRiskStatus";
import { useTrading } from "@/hooks/useTrading";
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
import { useOrderBase } from "./useOrderBase";
import { useApproveAmount } from "./useApproveAmount";
import { useLimitOrderUIState } from "./useLimitOrderUIState";
import { useLimitOrder } from "./useLimitOrder";

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
  const setTxStep = useTradeStore(state => state.setTxStep)
  const limitPrice = useTradeStore(state => state.limitPrice)
  const inputSize = useTradeStore(state => state.inputSize)
  const expires = useTradeStore(state => state.expires)
  const inputToken = useTradeStore(state => state.inputToken)
  const outputToken = useTradeStore(state => state.outputToken)
  const showConfirm = useSettingStore(state => state.showConfirm)

  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()
  const { riskStatus } = useRiskStatus()
  const action = useTradeStore(state => state.activeConvertTab) as "buy" | "sell"
  const { account, isSameChain } = useActiveWeb3()

  const paymentToken = useMemo(
    () => (action === 'buy' ? outputToken?.address : inputToken?.address),
    [action, inputToken?.address, outputToken?.address]
  )

  const inputTokenBalance = useTokenBalance(inputToken?.symbol || '')
  const outputTokenBalance = useTokenBalance(outputToken?.symbol || '')

  const rwaPrice = useTokenBalance(inputToken?.symbol || '')
  const realtimeData = useTradeStore(state => state.realtimeRwaData)
  const initPrice = useRef(false)
  const [inputTokenPrice, setInputTokenPrice] = useState<ITokenWithPrice | null>(null)

  useEffect(() => {
    if (rwaPrice && realtimeData && !initPrice.current) {
      initPrice.current = true
      setInputTokenPrice({ ...rwaPrice, price: String(realtimeData.p) })
    }
  }, [rwaPrice, realtimeData])

  const preToken = useRef<IRwa | null>(null)
  useEffect(() => {
    if (inputToken && realtimeData && preToken.current?.symbol !== inputToken?.symbol) {
      preToken.current = inputToken
      setInputTokenPrice({ ...rwaPrice, price: String(realtimeData.p) })
    }
  }, [inputToken, rwaPrice, realtimeData])

  useEffect(() => {
    updateInputSize('')
  }, [action, updateInputSize])

  useEffect(() => {
    if (inputTokenPrice) {
      updateLimitPrice(truncateUP(inputTokenPrice?.price ?? '0', 2))
    }
  }, [inputToken, inputTokenPrice, updateLimitPrice])

  const orderValue = useOrderBase(limitPrice, inputSize)

  const { estimatedFee, platformFee, brokerageFee, tradingActivityFee, allOrderValue } = useCalcFee(
    orderValue,
    inputSize,
    action === 'buy',
    inputToken?.feeRate
  )

  const approveAmount = useApproveAmount({
    paymentToken,
    orderValue,
    inputSize,
    action,
    inputToken,
    outputToken,
    estimatedFee,
    parseAmount,
  })

  const { placeOrder, txStep, approvalState, refetchAllowance } = useTrading(
    paymentToken as `0x${string}`,
    approveAmount
  )

  const { toastTxSteps, dismissTxToast } = useTxToast()
  const stepStartRef = useRef(false)

  useEffect(() => {
    if (stepStartRef.current) {
      setTxStep(txStep)
    }
  }, [txStep, setTxStep])

  const handleEndStep = useCallback(() => {
    dismissTxToast()
    setTxError('')
    setTxSuccess('', '', '')
    setTimeout(() => {
      stepStartRef.current = false
      setTxStep(approvalState === 3 ? 1 : 0)
      refetchAllowance()
    }, 500)
  }, [dismissTxToast, setTxError, setTxSuccess, setTxStep, approvalState, refetchAllowance])

  const handleStartStep = useCallback(() => {
    stepStartRef.current = true
    dismissTxToast()
    setTxError('')
    setTxSuccess('', '', '')
    setTxStep(approvalState === 3 ? 1 : 0)
    toastTxSteps({ action: 'place', approveed: approvalState === 3, onClick: handleEndStep })
  }, [dismissTxToast, setTxError, setTxSuccess, setTxStep, approvalState, toastTxSteps, handleEndStep])

  const order = useLimitOrder({
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
    onStart: handleStartStep,
    onSuccess: () => {
      freshTokenBalances()
      updateInputSize('')
    },
    onError: (message: string) => {
      setTxError(message)
    },
  })

  const uiState = useLimitOrderUIState({
    limitPrice,
    orderValue,
    inputSize,
    inputToken,
    outputToken,
    action,
    inputTokenBalance,
    outputTokenBalance,
    t,
    language: i18n.language,
  })

  const buttonVariant = useMemo(() => (action === 'buy' ? 'primary' : 'warning'), [action])

  const handlePriceChange = useCallback((value: string) => {
    updateLimitPrice(value)
  }, [updateLimitPrice])

  const handleSizeChange = useCallback((value: string) => {
    updateInputSize(value)
  }, [updateInputSize])

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
    } else if (value === 0 && inputTokenPrice) {
      updateLimitPrice(truncateUP(inputTokenPrice?.price ?? '0', 2))
    }
  }, [inputTokenPrice, updateLimitPrice])

  useRealtimeRwa(inputToken)

  useEffect(() => {
    if (inputToken?.symbol && initPrice.current) {
      initPrice.current = false
    }
  }, [inputToken])

  const kycButtonText = useMemo(() => {
    if (riskStatus !== RISK_STATUS.VERIFIED && riskStatus !== RISK_STATUS.DEFAULT) {
      return t('identity.verifyID')
    }
    return ''
  }, [t, riskStatus])

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
        action={action}
        limitPrice={limitPrice}
        inputSize={inputSize}
        orderValue={orderValue}
        allOrderValue={allOrderValue}
        isInsufficient={uiState.isBuyInsufficient}
        isSellInsufficient={uiState.isSellInsufficient}
        account={account}
        inputTokenSymbol={inputToken?.symbol}
        outputTokenSymbol={outputToken?.symbol}
        inputTokenBalance={inputTokenBalance?.balance}
        outputTokenBalance={outputTokenBalance?.balance}
        estimatedFee={estimatedFee}
        networkFeeInNative={marketInfo.networkFeeInNative}
        expires={expires}
        onPriceChange={handlePriceChange}
        onSizeChange={handleSizeChange}
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
        action={action}
        buying={order.loading}
        disabled={uiState.disabled}
        buttonText={uiState.buttonText}
        showConfirm={showConfirm}
        onSubmit={order.submit}
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
