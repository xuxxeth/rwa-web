import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useMemo } from "react";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { parseAmount } from "@/utils";
import { useToast } from "@/hooks/useToast";
import { useTokenBalance } from "@/hooks/useTokenBalances";
import { useTrading } from "@/hooks/useTrading";
import { useTxToast } from "@/hooks/useTxToast";
import { useCalcFee } from "@/hooks/useCalcFee";
import { cn } from "@/lib/utils";
import { TradeFormUI } from "./TradeFormUI";
import { TradeButtonUI } from "./TradeButtonUI";
import { MarketCloseTip } from "../MarketCloseTip";
import { useOrderBase } from "./useOrderBase";
import { useApproveAmount } from "./useApproveAmount";
import { useLimitOrderUIState } from "./useLimitOrderUIState";
import { useLimitOrder } from "./useLimitOrder";
import { useTradeStoreBindings } from "./useTradeStoreBindings";
import { useRealtimePriceSync } from "./useRealtimePriceSync";
import { useTxStepLifecycle } from "./useTxStepLifecycle";
import { useTradeGateState } from "./useTradeGateState";
import { useTradeCallbacks } from "./useTradeCallbacks";

type ConverBodyProps = {
  action?: string
  from?: string
}

export function ConverBody({
  from
}: ConverBodyProps) {
  const { t, i18n } = useTranslation()
  const { toastError } = useToast()
  const {
    marketInfo,
    freshTokenBalances,
    riskUserConfig,
    showConfirm,
    updateLimitPrice,
    updateInputSize,
    updateExpires,
    setTxError,
    setTxSuccess,
    setTxStep,
    limitPrice,
    inputSize,
    expires,
    inputToken,
    outputToken,
    action,
    realtimeData,
  } = useTradeStoreBindings()
  const { account, isSameChain } = useActiveWeb3()

  const paymentToken = useMemo(
    () => (action === 'buy' ? outputToken?.address : inputToken?.address),
    [action, inputToken?.address, outputToken?.address]
  )

  const inputTokenBalance = useTokenBalance(inputToken?.symbol || '')
  const outputTokenBalance = useTokenBalance(outputToken?.symbol || '')
  const { handlePriceInput, handleChangePrice } = useRealtimePriceSync({
    inputToken,
    rwaPrice: inputTokenBalance,
    realtimeData,
    limitPrice,
    updateLimitPrice,
  })

  useEffect(() => {
    updateInputSize('')
  }, [action, updateInputSize])

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
  const { handleStartStep } = useTxStepLifecycle({
    txStep,
    approvalState,
    setTxStep,
    setTxError,
    setTxSuccess,
    dismissTxToast,
    toastTxSteps,
    refetchAllowance,
  })

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
  const { handlePriceChange, handleSizeChange, handleExpiresChange } = useTradeCallbacks({
    onPriceInput: handlePriceInput,
    updateInputSize,
    updateExpires,
  })
  const {
    isSignatureValid,
    refreshIsSignatureValid,
    kycButtonText,
    isPageReady,
  } = useTradeGateState({
    account,
    isSameChain,
    inputToken,
    outputToken,
    inputTokenBalance,
    outputTokenBalance,
    approvalState,
    t,
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
        onExpiresChange={handleExpiresChange}
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
