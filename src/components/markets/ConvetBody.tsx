import { CurrencyInputPanel } from "@/components/v2/input/CurrencyInputPanel";
import { CurrencyInputPanel as CurrencyInputPanelLite } from "@/components/input/CurrencyInputPanel";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EstimatedInfo } from "../../views/lite-trade/components/EstimatedInfo";
import { cn } from "@/lib/utils";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { ConnectButtonText } from "@/components/button/ConnectButtonText";
import BigNumber from "bignumber.js";
import { formatTokenAmountWithCommas, isGreater, isLess, parseAmount, truncate, truncateUP } from "@/utils";
import { useShowDialog, DialogController } from '@/components/dialog/DialogController'
import { ExpiresSetting } from "../expires-setting";
import { useTradeStore } from "@/stores/tradeStore";
import { useBaseStore } from "@/stores/baseStore";
import { useToast } from "@/hooks/useToast";
import { useRwaPrice, useTokenBalance } from "@/hooks/useTokenBalances";
import { useSignatureValidStatus } from "@/hooks/useSignature";
import SignButton from "../button/SignButton";
import { useRiskStatus } from "@/hooks/useRiskStatus";
import { useTrading } from "@/hooks/useTrading";
import { SessionType, SideType, TifType, TradeType } from "@/hooks/useCaCommon";
import { usePendingStep } from "@/hooks/usePendingStep";
import { useKycExpired, useKycStatus } from "@/hooks/useKycStatus";
import type { IRwa, ITokenWithPrice } from "@/service/base/types";
import { useTxToast } from "@/hooks/useTxToast";
import { MarketCloseTip } from "./MarketCloseTip";
import { PriceChangeTab } from "./PriceChangeTab";
import { useCalcFee } from "@/hooks/useCalcFee";
import { USDTSelect } from "../usdt-select";
import { OrderConfirm } from "../order-confirm";
import { useSettingStore } from "@/stores/settingStore";
import { ConvertAction } from "./ConvertAction";
import { useKycStore } from "@/stores/kycStore";
import { KYC_OVERALL_STATUS } from "@/service/kyc/types";
import { useRealtimeRwa } from "@/hooks/useRealtimeRwa";
import { RISK_STATUS } from "@/config/constants";
import { useRouter } from "@/hooks/useRouter";
import { useTradePageReady } from "@/hooks/useTradePageReady";

type ConverBodyProps = {
  action?: string
  from?: string
}

export function ConverBody({
  from
}: ConverBodyProps) {
  const router = useRouter()
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
  const pendingStep = usePendingStep()
  const { expired } = useKycExpired()
  const action = useTradeStore(state => state.activeConvertTab)
  const { account, isSameChain } = useActiveWeb3()
  const expiresDialog = useShowDialog()
  const orderDialog = useShowDialog()
  const [orderValue, setOrderValue] = useState('')

  const paymentToken = useMemo(() => action === 'buy' ? outputToken?.address : inputToken?.address, [action, inputToken?.address, outputToken?.address])

  const rwaPrice = useTokenBalance(inputToken?.symbol || '')
  const realtimeData = useTradeStore(state => state.realtimeRwaData)
  const initPrice = useRef(false)
  // const inputTokenPrice = useStableRwaPrice(inputToken?.symbol || '')
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



  const { placeOrder, txStep, approvalState, allowance, refetchAllowance } = useTrading(paymentToken as `0x${string}`, BigInt(approveAmount))
  // 交易流程未开始，不执行更新step操作
  const stepStartRef = useRef(false)

  useEffect(() => {
    if (stepStartRef.current) {
      setTxStep(txStep)
    }
  }, [txStep])

  const handleStartStep = useCallback(() => {
    stepStartRef.current = true
    dismissTxToast()
    setTxError('')
    setTxSuccess('', '', '')
    setTxStep(approvalState === 3 ? 1 : 0)
    
  }, [setTxStep, approvalState])
  // 结束后重置step和状态
  // type: 成功 or 失败
  const handleEndStep = useCallback((type?: string, message?: string) => {
    dismissTxToast()
    setTxError('')
    setTxSuccess('', '', '')
    setTimeout(() => {
      stepStartRef.current = false
      setTxStep(approvalState === 3 ? 1 : 0)
      refetchAllowance()
    }, 500)

  }, [setTxStep, approvalState, refetchAllowance])

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
  // riskUserConfig.actions // 1. 只能买，2. 只能卖

  const handlePlaceOrder = useCallback(async () => {
    // 禁止交易
    if (riskUserConfig?.actions === 0) {
      toastError({title: t('v2.tx.t39')})
      return
    }
    // 禁止卖
    if (riskUserConfig?.actions === 1 && action === 'sell') {
      toastError({title: t('v2.tx.t41')})
      return
    }
    // 禁止买
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
      paymentToken: outputToken?.address || '', // address
      validDate: String(expires), // D
      networkFee: '0', // 0.002
      amount: '0', // 10 usdt
      price: parseAmount(truncateUP(limitPrice, 2)),   // 1 usdt
      size: parseAmount(inputSize)    // 10
    }

    setBuying(true)
    handleStartStep()
    toastTxSteps({action: 'place', approveed: approvalState === 3, onClick: handleEndStep})
    const result = await placeOrder(params, {value: parseAmount(marketInfo.networkFeeInNative, 18), wait: true, skipSimulate: true})
    console.log('place order result: ', result)
    setBuying(false)
    // const orderType = params.tradeType === TradeType.MARKET ? t('limit') : t('market')
    // const orderSide = params.side === SideType.BUYLIMIT ? t('Buy') : t('Sell')
    // const message = t('orderSuccess2', { orderType, orderSide, orderAmount: orderValue, tokenName: inputToken?.name })

    if (result && result?.code === 9200) {
      freshTokenBalances()
      updateInputSize('')
      // 交易成功，延迟3秒后再关闭toast，避免用户看不到结果
      // setTimeout(() => {
      //   handleEndStep()
      // }, 3000)
      // const message = t('orderSuccess2', { orderType, orderSide, orderAmount: orderValue, tokenName: inputToken?.name })

    } else {
      // const message = t('orderFail', { orderType, orderSide: orderSide.toLowerCase()})
      
      // @ts-ignore
      const errorMessage = result.data?.message
      const txMessage = errorMessage ? t(`appErr.${errorMessage}`) : t('appErr.placeOrderFail')
      
      setTxError(txMessage)
      
    }
 
  }, [
    approvalState, orderValue, limitPrice, inputSize, expires, action, paymentToken, inputToken, outputToken, marketInfo, 
    riskUserConfig,
    placeOrder, 
    freshTokenBalances, 
    handleStartStep,
    handleEndStep,
    updateInputSize,
    
    t
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
          inputToken?.state === 1 
          // || riskStatus !== RISK_STATUS.VERIFIED 
          // ||
          // kycStatus !== KYC_OVERALL_STATUS.VERIFIED ||
          // pendingStep.step === PENDING_STEPS.RISK3
          
          , 
    [orderValue, isInsufficient, isSellInsufficient, isMinOrMax, inputToken, action, pendingStep.step]
  )
  
  const kycButtonText = useMemo(() => {
    let text = ''
    if (riskStatus !== RISK_STATUS.VERIFIED && riskStatus !== RISK_STATUS.DEFAULT) {
      text = t('identity.verifyID')
    }
    return text
    
  }, [t, riskStatus])
  const buttonText = useMemo(() => {
    // if (expired) return t('kyc.t51')
    if (Number(limitPrice) <= 0) return t('Enter Limit Price')
    if (Number(orderValue) <= 0) return t('Enter an amount')
    // 先判断当前资产是否可交易
    if (inputToken?.state === 1) return t('tradingHalt')
    // 判断有没有超出最大或最小金额
    if (isMinOrMax.min) return t('amountMin', { amount: inputToken?.minLimitTradeAmount + ' ' + outputToken?.symbol })
    if (isMinOrMax.max) return t('amountMax', { amount: inputToken?.maxLimitTradeAmount + ' ' + outputToken?.symbol })
    if (isInsufficient) return i18n.language === 'zh' ? outputToken?.symbol + ' ' + t("Insufficient") : t("Insufficient") + ' ' + outputToken?.symbol
    if (isSellInsufficient) return i18n.language === 'zh' ? inputToken?.symbol + ' ' + t("Insufficient") :  t("Insufficient") + ' ' + inputToken?.symbol
    // if (approvalState !== 3) return t("approve")
    return (actionText + ` ${inputToken?.symbol}`) 

  }, [t, limitPrice, actionText, buying, disabled, inputToken, outputToken, orderValue, isInsufficient, isSellInsufficient, approvalState, isMinOrMax, pendingStep.step, i18n.language])

  const handleChangePrice = useCallback((value: number) => {
    // 所有的价格变化都以inputTokenPrice?.price为基础
    const basePrice = inputTokenPrice?.price ?? '0'
    if (Number(basePrice) && value !== 0) {
      const changeValue = new BigNumber(basePrice)
          .multipliedBy(Math.abs(value))
          .dividedBy(100)
          .decimalPlaces(2, BigNumber.ROUND_UP) // 保留 2 位小数，向上取整
      const newPrice = value > 0 ?
        new BigNumber(basePrice).plus(changeValue).toFixed(2) :
        new BigNumber(basePrice).minus(changeValue).isLessThan(0) ? '0' :
        new BigNumber(basePrice).minus(changeValue).toFixed(2)
      updateLimitPrice(newPrice)
    } else if (value === 0) {
      // 点击最新价
      if (inputTokenPrice) {
        updateLimitPrice(truncateUP(inputTokenPrice?.price ?? '0', 2))
      }
    }
  }, [inputTokenPrice, updateLimitPrice])

  useRealtimeRwa(inputToken)
  
  useEffect(() => {
    if (inputToken?.symbol) {
      if (initPrice.current) {
        initPrice.current = false
      }
    }
  }, [inputToken])
  
  // useEffect(() => {
  //   let onKey = ''
  //   let listener = null
  //   if (inputToken?.symbol) {
  //     if (onKey && listener) {
  //       // @ts-ignore
  //       wsService.off(onKey, listener)
  //     }
  //     onKey = `realtime.${inputToken.symbol}`
  //     listener = (rwa: ISummaryDataItem) => {
  //       const precision = inputToken?.precision
  //       const _data = {
  //         ...rwa,
  //         p: truncateUP(rwa.p || 0, precision), // 最新价
  //         o: truncateUP(rwa.o || 0, precision), // 今开价
  //         l: truncateUP(rwa.l || 0, precision), // 最低价
  //         h: truncateUP(rwa.h || 0, precision), // 最高价
  //         c: truncateUP(rwa.c || 0, precision), // 当日收盘价
  //         pc: truncateUP(rwa.pc || 0, precision), // 昨日收盘价
  //       } as any
  //       setRealtimeData(_data)
  //     }
  //     // @ts-ignore
  //     wsService.on(onKey, listener)
  //   }

  //   return () => {
  //     if (onKey && listener) {
  //       // @ts-ignore
  //       wsService.off(onKey, listener)
  //     }
  //   }
  // }, [inputToken])

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
      {
        from === 'markets' && <>
          <CurrencyInputPanel
            value={limitPrice}
            from={from}
            mode="price"
            label={t('v2.tx.t24')}
            onUserInput={hanleInputPrice}
          />
          <PriceChangeTab onChange={handleChangePrice} />
          <div className="h-3"></div>
          <CurrencyInputPanel 
            value={inputSize}
            regex="^\d*$"
            from={from}
            type="size"
            label={t('v2.tx.t25')}
            placeholder={'0'}
            onUserInput={hanleInputQuantity}
            isInsufficient={isSellInsufficient}
          />
          <div className="h-3"></div>
          <USDTSelect 
            label={action === 'buy' ? t('v2.tx.t26') : t('v2.tx.t27')}
            orderValue={allOrderValue}
          />
          
        </>
      }
      
      {
        from === 'lite-trade' && <>
          <CurrencyInputPanelLite
            value={limitPrice}
            from={from}
            mode="price"
            label={t('v2.tx.t24')}
            placeholder={t('Enter Limit Price')}
            onUserInput={hanleInputPrice}
            handleChangePrice={handleChangePrice}
          />
          <div className="h-1"></div>
          <div className={cn(
            "flex flex-col",
            action === 'buy' ? 'flex-col-reverse' : ' '
          )}>
            <CurrencyInputPanelLite 
              value={inputSize}
              regex="^\d*$"
              from={from}
              label={action === 'sell' ? t('v2.tx.t26') : t('v2.tx.t27')}
              placeholder={t('Enter an amount')}
              onUserInput={hanleInputQuantity}
              isInsufficient={isSellInsufficient}
              action={action}
            />
            <div className="h-1 relative">
              <ConvertAction />
            </div>
            <CurrencyInputPanelLite
              from={from}
              mode="out"
              label={action === 'buy' ? t('v2.tx.t26') : t('v2.tx.t27')}
              value={allOrderValue}
              isInsufficient={isInsufficient}
              action={action}
            />
          </div>
          
        </>
      }
      {
        account && 
        <div>
          <div className={cn(
            " flex items-center justify-between text-[12px] mt-3 text-[#9DA3AF] px-3",
          )}>
            <div>{t('avbl')}: </div>
            <div>
              <span className={cn(
                "text-[#FFFFFF]",
                isInsufficient ? "text-[#CA3F64]" : ""
              )}> 
                {
                  action === 'buy' ?
                  formatTokenAmountWithCommas(outputTokenBalance?.balance || '0') :
                  formatTokenAmountWithCommas(inputTokenBalance?.balance || '0')
                }
                <span className="ml-1">
                  {
                    action === 'buy' ? outputToken?.symbol : inputToken?.symbol
                  }
                </span>
                
              </span>
            </div>
          </div>
        </div>
      }
      <div className={cn(
        " opacity-0",
        isPageReady ? " opacity-100" : ""
      )}>
        {
          (!account || !isSameChain) ? 
            <div className="mt-3"><ConnectButtonText /></div> :
            !isSignatureValid ?
            <SignButton className="mt-3 w-full h-[40px] rounded-[8px] text-[14px]" refreshIsSignatureValid={() => {
              refreshIsSignatureValid()
            }} /> :
            kycButtonText ? 
            <Button
              className="h-[40px] w-full mt-3"
              onClick={() => {
                router.push('/identity')
              }}
            >{kycButtonText}
            </Button> : 
            <Button variant={buttonVariant} 
              loading={buying}
              className={cn(
                "w-full mt-3 ",
                from === 'markets' ? 'h-[40px]' : '',
                action === 'buy' ? 'bg-[rgba(37,167,80,0.2)] text-[#2EE4A7]' : 'bg-[rgba(202,63,100,0.2)] text-[#F63C6B]'
              )}
              disabled={disabled || buying}
              onClick={() => {
                if (showConfirm) {
                  orderDialog.setOpen(true)
                  return
                }
                handlePlaceOrder()
              }}
            >
              { buttonText }
              
            </Button>
        }
      </div>
      
      {
        Number(orderValue) > 0 && 
          <EstimatedInfo
            slippage={3}
            maxSlippage={'5'}
            tradeType={TradeType.LIMIT}
            estimatedFee={estimatedFee}
            networkFeeInNative={marketInfo.networkFeeInNative}
            expires={expires}
            onEdit={() => {
            expiresDialog.show()
          }} />
      }
      <MarketCloseTip />

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