import { CurrencyInputPanel } from "@/components/input/CurrencyInputPanel";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EstimatedInfo } from "../../views/lite-trade/components/EstimatedInfo";
import { cn } from "@/lib/utils";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { ConnectButtonText } from "@/components/button/ConnectButtonText";
import BigNumber from "bignumber.js";
import { parseAmount } from "@/utils";
import { useShowDialog, DialogController } from '@/components/dialog/DialogController'
import { useTrading } from "@/hooks/useCaCommon";
import { ExpiresSetting } from "../expires-setting";
import { useTradeStore } from "@/stores/tradeStore";

const usdtToken = '0xbeD5856646F1faBDFc565F47f8Ea18685466B745'
const applcToken = '0xE6d44C1f14D98AEf73c822d0319751701D54D4cc'
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
  const tradeStore = useTradeStore()
  const { account } = useActiveWeb3()
  const expiresDialog = useShowDialog()

  const [limitPrice, setLimitPrice] = useState('0')
  const [quantity, setQuantity] = useState('0')
  const [orderValue, setOrderValue] = useState('0')
  const paymentToken = useMemo(() => action === 'buy' ? usdtToken : applcToken, [action])

  const { placeOrder, approvalState, allowance } = useTrading(paymentToken, trading, BigInt(parseAmount(orderValue)))
  console.log('approvalState: ', approvalState, allowance)
  console.log('orderValue: ', parseAmount(orderValue))
  const hanleInputPrice = useCallback(async (value: string) => {
    tradeStore.updateLimitPrice(value)
  }, [])
  const hanleInputQuantity = useCallback(async (value: string) => {
    tradeStore.updateInputSize(value)
  }, [])
  
  useEffect(() => {
    if (Number(tradeStore.limitPrice) && Number(tradeStore.inputSize)) {
      const result = new BigNumber(tradeStore.limitPrice)
        .multipliedBy(tradeStore.inputSize)
        .decimalPlaces(6, BigNumber.ROUND_DOWN) // 保留 6 位小数，向下取整
      setOrderValue(result.toFixed())
    }
    
  }, [tradeStore.limitPrice, tradeStore.inputSize])

  const disabled = useMemo(() => Number(orderValue) <= 0, [orderValue])
  const [txHistory, setTxHistory] = useState<string[]>([])
  const [buying, setBuying] = useState(false)

  const handlePlaceOrder = useCallback(async () => {
    const params = {
      stockId: '1',
      tradeType: '0',
      side: action === 'buy' ? '0' : '1',
      tif: '1',
      sessionType: '0',
      paymentToken: usdtToken, // address
      validDate: '10', // s String(7 * 24 * 60 * 60)
      networkFee: '30000', // 0.002
      amount: '0', // 10 usdt
      price: parseAmount(limitPrice),   // 1 usdt
      size: parseAmount(quantity)    // 10
    }
    console.log(params)
    setBuying(true)
    const result = await placeOrder(params, {})
    setBuying(false)
    console.log(result)
    // @ts-ignore
    if (result?.data?.transactionHash) {
      // @ts-ignore
      setTxHistory([...txHistory, result?.data?.transactionHash?.hash || result?.data?.transactionHash])
    }
  }, [limitPrice, quantity, orderValue, txHistory, action, paymentToken, placeOrder])

  const buttonVariant = useMemo(() => (action === 'buy' ? 'primary' : 'warning'), [action])
  const buttonText = useMemo(() => (action === 'buy' ? t('Buy') : t('Sell')), [action, t])

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
      />
      <EstimatedInfo
        expires={tradeStore.expires}
        onEdit={() => {
        expiresDialog.show()
      }} />
      <div className=" flex flex-col gap-y-3">
        {
          txHistory.map(hash => {
            return <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" key={hash} className=" underline text-blue-500">{hash}</a>
          })
        }
      </div>
      
      {
        !account ? <ConnectButtonText /> :
        <Button variant={buttonVariant} className={cn(
          "w-full mt-8",
          from === 'markets' ? 'h-[52px]' : ''
        )}
          disabled={disabled || buying}
          onClick={() => handlePlaceOrder()}
        >
          { disabled ? t('Enter an amount') : buying ? (action === 'buy' ? 'Buying' : 'Selling') : (buttonText + ' APPLc') }
          
        </Button>
      }
      <DialogController
        title={t("Expires in")}
        open={expiresDialog.open}
        openChange={expiresDialog.setOpen}
      > 
        <ExpiresSetting onConfirm={value => {
          tradeStore.updateExpires(value)
          expiresDialog.hide()
        } } />
      </DialogController>
    </div>
  )
}