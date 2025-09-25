import { CurrencyInputPanel } from "@/components/input/CurrencyInputPanel";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EstimatedInfo } from "../../views/lite-trade/components/EstimatedInfo";
import { cn } from "@/lib/utils";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { ConnectButtonText } from "@/components/button/ConnectButtonText";
import BigNumber from "bignumber.js";
import { useTrading } from "ca-common-web";
import { parseAmount } from "@/utils";

const token = '0xbeD5856646F1faBDFc565F47f8Ea18685466B745'

type ConverBodyProps = {
  action?: string
  from?: string
}

export function ConverBody({
  action = 'buy',
  from
}: ConverBodyProps) {
  const { t } = useTranslation()
  const { account } = useActiveWeb3()

  const [limitPrice, setLimitPrice] = useState('0')
  const [quantity, setQuantity] = useState('0')
  const [orderValue, setOrderValue] = useState('0')
  const { placeOrder, approvalState, allowance } = useTrading(token, BigInt(parseAmount(orderValue)) )
  console.log('approvalState: ', approvalState, allowance)
  console.log('orderValue: ', parseAmount(orderValue))
  const hanleInputPrice = useCallback(async (value: string) => {
    setLimitPrice(value)
  }, [])
  const hanleInputQuantity = useCallback(async (value: string) => {
    setQuantity(value)
  }, [])
  
  useEffect(() => {
    if (Number(limitPrice) && Number(quantity)) {
      const result = new BigNumber(limitPrice)
        .multipliedBy(quantity)
        .decimalPlaces(6, BigNumber.ROUND_DOWN) // 保留 6 位小数，向下取整
      setOrderValue(result.toFixed())
    }
    
  }, [limitPrice, quantity])

  const disabled = useMemo(() => Number(orderValue) <= 0, [orderValue])
  const [txHistory, setTxHistory] = useState<string[]>([])
  const [buying, setBuying] = useState(false)

  const handlePlaceOrder = useCallback(async () => {
    const params = {
      stockId: '1',
      tradeType: '0',
      side: '0',
      tif: '1',
      sessionType: '0',
      paymentToken: '0xbeD5856646F1faBDFc565F47f8Ea18685466B745', // address
      validDate: '10', // s String(7 * 24 * 60 * 60)
      networkFee: '30000', // 0.002
      amount: parseAmount(orderValue), // 10 usdt
      price: parseAmount(limitPrice),   // 1 usdt
      size: parseAmount(quantity)    // 10
    }
    console.log(params)
    setBuying(true)
    const result = await placeOrder(params, {})
    setBuying(false)
    console.log(result)
    // @ts-ignore
    // if (result?.data?.transactionHash) {
    //   // @ts-ignore
    //   setTxHistory([...txHistory, result?.data?.transactionHash])
    // }
  }, [limitPrice, quantity, orderValue, txHistory, placeOrder])

  const buttonVariant = useMemo(() => (action === 'buy' ? 'primary' : 'warning'), [action])
  const buttonText = useMemo(() => (action === 'buy' ? t('Buy') : t('Sell')), [action, t])

  console.log(txHistory)

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
      <EstimatedInfo />
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
          { disabled ? t('Enter an amount') : buying ? 'Buying' : buttonText + ' APPLc' }
          
        </Button>
      }
      
    </div>
  )
}