import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useMemo } from "react";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { parseAmount, truncateUP } from "@/utils";
import { TradeType } from "@/hooks/useCaCommon";
import { MARKET_STATUS } from "@/config/constants";
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
import { useEffectivePrice } from "./useEffectivePrice";
import { EstimatedInfo } from "@/views/lite-trade/components/EstimatedInfo";
import { useBaseStore } from "@/stores/baseStore";
import { useTradeStore } from "@/stores/tradeStore";
import { DialogController, useShowDialog } from "@/components/dialog/DialogController";
import { ExpiresSetting } from "@/components/expires-setting";
import { Slippage } from "@/components/slippage";
import { isTiko } from "@/service/client";

type TradeBoxProps = {
  action?: string
  from?: string
}

export function TradeBox({
  from
}: TradeBoxProps) {
  const { t, i18n } = useTranslation()
  const { toastError } = useToast()
  const expiresDialog = useShowDialog()

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
    updateSlippage,
    limitPrice,
    inputSize,
    expires,
    inputToken,
    outputToken,
    action,
    realtimeData,
    slippage
  } = useTradeStoreBindings()
  const { account, isSameChain } = useActiveWeb3()
  const marketTradeState = useBaseStore(state => state.marketTradeState)
  const tradeType = useTradeStore(state => state.tradeType)
  const sessionType = useTradeStore(state => state.sessionType)
  const isMarketCloseDisabled = marketTradeState === MARKET_STATUS.CLOSE && tradeType === TradeType.MARKET && isTiko
  const effectivePrice = useEffectivePrice({
    tradeType,
    action,
    limitPrice,
    slippage,
  })
  const paymentToken = useMemo(
    () => (action === 'buy' ? outputToken?.address : inputToken?.address),
    [action, inputToken?.address, outputToken?.address]
  )

  const inputTokenBalance = useTokenBalance(inputToken?.symbol || '')
  const outputTokenBalance = useTokenBalance(outputToken?.symbol || '')
  const { inputTokenPrice, handlePriceInput, handleChangePrice } = useRealtimePriceSync({
    inputToken,
    rwaPrice: inputTokenBalance,
    realtimeData,
    tradeType,
    limitPrice,
    updateLimitPrice,
  })

  useEffect(() => {
    if (tradeType !== TradeType.MARKET) return
    const initialPrice = truncateUP(String(inputTokenPrice?.price ?? realtimeData?.p ?? 0), 2)
    if (initialPrice !== limitPrice) {
      updateLimitPrice(initialPrice)
    }
  }, [tradeType, inputTokenPrice?.price, realtimeData?.p, limitPrice, updateLimitPrice])

  useEffect(() => {
    updateInputSize('')
  }, [action, updateInputSize])

  const orderValue = useOrderBase(effectivePrice, inputSize)

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
  const { handlePriceChange, handleSizeChange, handleSlippageChange } = useTradeCallbacks({
    onPriceInput: handlePriceInput,
    updateInputSize,
    updateExpires,
    updateSlippage,
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
    action,
    riskUserConfig,
    t,
  })

  return (
    <>
      <div className={cn(
        "mt-3",
        from === 'lite-trade' ? 'mt-0' : ''
      )}>
        <TradeFormUI
          from={from}
          action={action}
          tradeType={tradeType}
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
          tradeType={tradeType}
          sessionType={sessionType}
          slippage={slippage}
          buying={order.loading}
          disabled={uiState.disabled || isMarketCloseDisabled}
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

        {Number(orderValue) > 0 && (
          <EstimatedInfo
            tradeType={tradeType}
            slippage={slippage}
            estimatedFee={estimatedFee}
            networkFeeInNative={marketInfo.networkFeeInNative}
            maxSlippage={marketInfo.slippage}
            expires={expires}
            onEdit={() => {
              expiresDialog.show()
            }}
          />
        )}
      </div>
      

      <DialogController
        className="bg-[#131416] px-0"
        headerClassName="px-6"
        title={t('v3.t5')}
        open={expiresDialog.open}
        openChange={expiresDialog.setOpen}
      >
        <Slippage
          maxSlippage={Number(marketInfo.slippage) * 100 + ''}
          slippage={slippage}
          onConfirm={(value) => {
            handleSlippageChange(value)
            expiresDialog.hide()
          }}
        />
      </DialogController>
    </>
    
  )
}
