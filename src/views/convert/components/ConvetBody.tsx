import { CurrencyInputPanel } from "@/components/input/CurrencyInputPanel";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EstimatedInfo } from "./EstimatedInfo";
import { cn } from "@/lib/utils";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { ConnectButtonText } from "@/components/button/ConnectButtonText";
import BigNumber from "bignumber.js";
import { useChains, useTrading } from "ca-common-web";
import { parseAmount } from "@/utils";

const token = '0xbeD5856646F1faBDFc565F47f8Ea18685466B745'
const spender = '0xE39D6363b446016d8a17da2416c1f8C651e6FB3E'

export function ConverBody() {
  const { t } = useTranslation()
  const { account } = useActiveWeb3()

  const [limitPrice, setLimitPrice] = useState('0')
  const [quantity, setQuantity] = useState('0')
  const [orderValue, setOrderValue] = useState('0')
  const { placeOrder, approvalState, contract } = useTrading(token, spender, BigInt(orderValue) * 10n ** 6n)
  const chains = useChains()
  console.log('approvalState: ', approvalState)

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
    const result = await placeOrder(params)
    setBuying(false)
    console.log(result)
    if (result?.data?.transactionHash) {
      setTxHistory([...txHistory, result?.data?.transactionHash])
    }
  }, [limitPrice, quantity, orderValue, txHistory])

  return (
    <div className="mt-4">
      <CurrencyInputPanel 
        mode="price"
        label={t('Limit price')}
        onUserInput={hanleInputPrice}
      />
      <div className="h-2"></div>
      <CurrencyInputPanel 
        label={t('Quantity')}
        placeholder={t('Whole shares only')}
        onUserInput={hanleInputQuantity}
      />
      <div className="h-2"></div>
      <CurrencyInputPanel
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
        <Button className={cn(
          "w-full mt-8",
        )}
          disabled={disabled || buying}
          onClick={() => handlePlaceOrder()}
        >
          { disabled ? 'Enter an amount' : buying ? 'Buying' : 'Buy' }
          
        </Button>
      }
      
    </div>
  )
}