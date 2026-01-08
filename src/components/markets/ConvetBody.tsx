import { CurrencyInputPanel } from "@/components/input/CurrencyInputPanel";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EstimatedInfo } from "../../views/lite-trade/components/EstimatedInfo";
import { cn } from "@/lib/utils";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { ConnectButtonText } from "@/components/button/ConnectButtonText";
import BigNumber from "bignumber.js";
import { isGreater, isLess, parseAmount, truncateUP } from "@/utils";
import { useShowDialog, DialogController } from '@/components/dialog/DialogController'
import { ExpiresSetting } from "../expires-setting";
import { useTradeStore } from "@/stores/tradeStore";
import { useBaseStore } from "@/stores/baseStore";
import { useToast } from "@/hooks/useToast";
import { useRwaPrice, useStableRwaPrice, useTokenBalance } from "@/hooks/useTokenBalances";
import { useSignatureValidStatus } from "@/hooks/useSignature";
import SignButton from "../button/SignButton";
import { useRiskStatus } from "@/hooks/useRiskStatus";
import { RISK_STATUS } from "@/config/constants";
import { useTrading } from "@/hooks/useTrading";
import { SessionType, SideType, TifType, TradeType } from "@/hooks/useCaCommon";
import { usePendingStep } from "@/hooks/usePendingStep";
import { KYC_OVERALL_STATUS, PENDING_STEPS } from "@/service/kyc/types";
import { useKycExpired, useKycStatus } from "@/hooks/useKycStatus";
import type { IRwa, IRwaPrice, ITokenWithPrice } from "@/service/base/types";

type ConverBodyProps = {
  action?: string
  from?: string
}

export function ConverBody({
  from
}: ConverBodyProps) {
  const { t, i18n } = useTranslation()
  const { toastError, toastSuccess } = useToast()
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
  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()
  const { riskStatus } = useRiskStatus()
  const { kycStatus } = useKycStatus()
  const pendingStep = usePendingStep()
  const { expired } = useKycExpired()
  const action = useTradeStore(state => state.activeConvertTab)
  const { account } = useActiveWeb3()
  const expiresDialog = useShowDialog()
  const [orderValue, setOrderValue] = useState('')

  const paymentToken = useMemo(() => action === 'buy' ? outputToken?.address : inputToken?.address, [action, inputToken?.address, outputToken?.address])

  const rwaPrice = useRwaPrice(inputToken?.symbol || '')
  const initPrice = useRef(false)
  // const inputTokenPrice = useStableRwaPrice(inputToken?.symbol || '')
  const [inputTokenPrice, setInputTokenPrice] = useState<ITokenWithPrice | null>(null)

  useEffect(() => {
    if (rwaPrice && !initPrice.current) {
      initPrice.current = true
      setInputTokenPrice(rwaPrice)
    }
  }, [rwaPrice])
  const preToken = useRef<IRwa | null>(null)
  useEffect(() => {

    if (inputToken && preToken.current?.symbol !== inputToken?.symbol) {
      preToken.current = inputToken
      setInputTokenPrice(rwaPrice)
    }
  }, [inputToken, rwaPrice])

  const approveAmount = useMemo(() => {
    return action === 'buy' ?
            (orderValue ? parseAmount(orderValue, outputToken?.decimals) : '0') :
            (inputSize ? parseAmount(inputSize, inputToken?.decimals) : '0')
  }, [orderValue, inputSize, outputToken, inputToken, action, ])

  console.log('orderValue: ', orderValue, approveAmount)
  console.log('approveToken: ', paymentToken)

  const { placeOrder, approve, refetchAllowance, approvalState, allowance } = useTrading(paymentToken as `0x${string}`, BigInt(approveAmount))
  console.log(approvalState, allowance)
  const hanleInputPrice = useCallback(async (value: string) => {
    updateLimitPrice(value)
  }, [])
  const hanleInputQuantity = useCallback(async (value: string) => {
    updateInputSize(value)
  }, [])

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
          .decimalPlaces(6, BigNumber.ROUND_DOWN) // 保留 6 位小数，向下取整
        setOrderValue(result.toFixed())
      
    } else {
      setOrderValue('')
    }
    
  }, [limitPrice, inputSize])

  const [buying, setBuying] = useState(false)
  const [approveInsufficient, setApproveInsufficient] = useState(false)
  const handleApprove = useCallback(async () => {
    setBuying(true)
    const result = await approve()
    if (result && result?.code === 9200) {
      // toastSuccess({title: t('approveSuccess')})
      // 这里再查询下授权额度？
      const _allowance = await refetchAllowance()
      if (isLess(_allowance.toString(), approveAmount)) {
        setApproveInsufficient(false)
        toastError({
          title: t('appErr.apIns')
        })
      } else {
        toastSuccess({title: t('approveSuccess')})
      }
    } else {
      // @ts-ignore
      const errorMessage = result.data?.message
      if (errorMessage) {
        toastError({
          title: t('appErr.approveError') + t(`appErr.${errorMessage}`),
        })
      } else {
        toastError({
          // @ts-ignore
          title: result.data?.name || t('appErr.UnknownErro'),
        })
      }
    }
    setBuying(false)
    setApproveInsufficient(true)
  }, [approveAmount, approve, refetchAllowance]) 

  const handlePlaceOrder = useCallback(async () => {
    const params = {
      stockId: String(inputToken?.stockId),
      tradeType: TradeType.LIMIT,
      side: action === 'buy' ? SideType.BUYLIMIT : SideType.SELL,
      tif: TifType.DAY,
      sessionType: SessionType.DEFAULT,
      paymentToken: outputToken?.address || '', // address
      validDate: String(expires), // D
      networkFee: '0', // 0.002
      amount: '0', // 10 usdt
      price: parseAmount(truncateUP(limitPrice, 2)),   // 1 usdt
      size: parseAmount(inputSize)    // 10
    }
    console.log(params)
    setBuying(true)
    const result = await placeOrder(params, {value: parseAmount(marketInfo.networkFeeInNative, 18), wait: true, skipSimulate: true})
    setBuying(false)
    const orderType = params.tradeType === TradeType.MARKET ? t('limit') : t('market')
    const orderSide = params.side === SideType.BUYLIMIT ? t('Buy') : t('Sell')
    
    if (result && result?.code === 9200) {
      freshTokenBalances()
      updateInputSize('')
      // const message = t('orderSuccess2', { orderType, orderSide, orderAmount: orderValue, tokenName: inputToken?.name })
      // toastSuccess({title: message})

      toastSuccess({title: t('orderSuccess')})
    } else {
      // const message = t('orderFail', { orderType, orderSide: orderSide.toLowerCase()})
      // toastError({title: message})
      // @ts-ignore
      const errorMessage = result.data?.message
      if (errorMessage) {
        toastError({
          title:  t('appErr.signError') + t(`appErr.${errorMessage}`),
        })
      } else {
        toastError({
          // @ts-ignore
          title: result.data?.name || t('appErr.placeOrderFail'),
        })
      }
      
    }
 
  }, [orderValue, limitPrice, inputSize, expires, action, paymentToken, inputToken, outputToken, marketInfo, placeOrder, freshTokenBalances, t])

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
    () => action === 'buy' && orderValue ? (isGreater(orderValue, outputTokenBalance?.balance || '0')) : false, 
    [orderValue, outputTokenBalance, action]
  )

  const isSellInsufficient = useMemo(
    () => action === 'sell' && inputSize ? (isGreater(inputSize, inputTokenBalance?.balance || '0')) : false, 
    [inputSize, inputTokenBalance, action]
  )

  const disabled = useMemo(
    () => Number(orderValue) <= 0 || 
          (action === 'buy' ? !!isInsufficient : !!isSellInsufficient) || 
          isMinOrMax.min || isMinOrMax.max || 
          inputToken?.state === 1 ||
          riskStatus !== RISK_STATUS.VERIFIED ||
          kycStatus !== KYC_OVERALL_STATUS.VERIFIED ||
          pendingStep.step === PENDING_STEPS.RISK3
          
          , 
    [orderValue, isInsufficient, isSellInsufficient, isMinOrMax, inputToken, riskStatus, kycStatus, action, pendingStep.step]
  )

  const buttonText = useMemo(() => {
    if (expired) return t('kyc.t51')
    if (kycStatus === KYC_OVERALL_STATUS.NOTVERIFIED) return t('identity.verifyID')
    if (Number(limitPrice) <= 0) return t('Enter Limit Price')
    if (Number(orderValue) <= 0) return t('Enter an amount')
    // 先判断当前资产是否可交易
    if (inputToken?.state === 1) return t('tradingHalt')
    // 判断有没有超出最大或最小金额
    if (isMinOrMax.min) return t('amountMin', { amount: inputToken?.minLimitTradeAmount + ' ' + outputToken?.symbol })
    if (isMinOrMax.max) return t('amountMax', { amount: inputToken?.maxLimitTradeAmount + ' ' + outputToken?.symbol })
    if (isInsufficient) return i18n.language === 'zh' ? outputToken?.symbol + ' ' + t("Insufficient") : t("Insufficient") + ' ' + outputToken?.symbol
    if (isSellInsufficient) return i18n.language === 'zh' ? inputToken?.symbol + ' ' + t("Insufficient") :  t("Insufficient") + ' ' + inputToken?.symbol
    if (approvalState !== 3) return t("approve")
    return (actionText + ` ${inputToken?.symbol}`)

  }, [t, limitPrice, actionText, buying, disabled, inputToken, outputToken, orderValue, isInsufficient, isSellInsufficient, approvalState, isMinOrMax, kycStatus, pendingStep.step, expired, i18n.language])

  return (
    <div className="mt-2">
      <CurrencyInputPanel
        value={limitPrice}
        from={from}
        mode="price"
        label={t('Limit price')}
        onUserInput={hanleInputPrice}
      />
      <div className="h-2"></div>
      <CurrencyInputPanel 
        value={inputSize}
        regex="^\d*$"
        from={from}
        label={t('Quantity')}
        placeholder={t('Whole shares only')}
        onUserInput={hanleInputQuantity}
        isInsufficient={isSellInsufficient}
        quantityValue={orderValue}
      />
      <div className="h-2"></div>
      <CurrencyInputPanel
        from={from}
        mode="out"
        label={t('Order Value')}
        value={orderValue}
        isInsufficient={isInsufficient}
        orderValue={orderValue}
      />
      {
        Number(orderValue) > 0 && 
          <EstimatedInfo
            marketInfo={marketInfo}
            inputToken={inputToken}
            outputToken={outputToken}
            expires={expires}
            onEdit={() => {
            expiresDialog.show()
          }} />
      }
      
      {
        !account ? 
          <div className="mt-4"><ConnectButtonText /></div> :
          !isSignatureValid ?
          <SignButton className="mt-4 w-full h-[56px] rounded-[16px] text-[16px]" refreshIsSignatureValid={() => {
            refreshIsSignatureValid()
          }} /> :
          <Button variant={buttonVariant} 
            loading={buying}
            className={cn(
              "w-full mt-4 ",
              from === 'markets' ? 'h-[52px]' : ''
            )}
            disabled={disabled || buying}
            onClick={() => {
              if (approvalState === 3) {
                handlePlaceOrder()
              } else {
                handleApprove()
              }
            }}
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