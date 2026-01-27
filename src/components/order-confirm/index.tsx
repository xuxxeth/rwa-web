import { memo, useState } from "react"
import { BetweenText } from "../between-text"
import { LazyImage } from "../image/LazyImage"
import { Button } from "../ui/button"
import { CheckBox } from "../v2/check-box"
import { cn } from "@/utils/tw"
import { useTradeStore } from "@/stores/tradeStore"
import { useTranslation } from "@/hooks/useTranslation"
import { useSettingStore } from "@/stores/settingStore"
import IconWithTooltip, { TooltipWithBorder } from "../icon-tooltip"



type OrderConfirmProps = {
  networkFeeInNative?: string,
  orderValue?: string,
  platformFee: string,
  brokerageFee: string,
  tradingActivityFee: string,
  estimatedFee: string,
  action: string
  onClick?: () => void
}

const OrderConfirm = memo(
  ({ 
    action,
    orderValue,
    platformFee, 
    brokerageFee, 
    tradingActivityFee, 
    estimatedFee,
    networkFeeInNative,
    onClick
  }: OrderConfirmProps) => {
    const { t } = useTranslation()
    const [showDetails, setShowDetails] = useState(false);
    const inputToken = useTradeStore(state => state.inputToken)
    const outputToken = useTradeStore(state => state.outputToken)
    const limitPrice = useTradeStore(state => state.limitPrice)
    const inputSize = useTradeStore(state => state.inputSize)
    const setShowConfirm = useSettingStore(state => state.setShowConfirm)
    const [innerShow, setInnerShow] = useState(false)
    const feeSymbol = outputToken?.symbol || 'USDT'
    const allFee = `${(orderValue && estimatedFee) ? (parseFloat(orderValue) + parseFloat(estimatedFee)).toFixed(2) : '0.00'} ${outputToken?.symbol || 'USDT'}`

    return (
      <div className="w-[420px] border-t border-[#232427] px-6 py-4 min-h-[426px]">
        <div className={cn(
          "flex flex-col",
          action === 'buy' ? ' flex-col-reverse' : ''
        )}>
          <div className="py-1">
            <BetweenText 
              left={<div className="text-[14px] font-normal text-white">{inputSize}&nbsp;{inputToken?.symbol}</div>}
              right={inputToken?.icon ? <LazyImage src={inputToken?.icon} className="w-8 h-8 rounded-full" /> : null}
            />
          </div>
          
          <div>
            <LazyImage src="/images/v2/icons/arrow-down2.png" className="my-1 w-4 h-4" />
          </div>
          <div className="py-1">
            <BetweenText 
              left={<div className="text-[14px] font-normal text-white">{orderValue ?? ''} {outputToken?.symbol}</div>}
              right={outputToken?.icon ? <LazyImage src={outputToken?.icon} className="w-8 h-8 rounded-full" /> : null}
            />
          </div>
        </div>
        
        <div className="mt-4 space-y-1">
          <BetweenText 
            left={t('v2.tx.t30')}
            right={t('limit')}
          />
          <BetweenText 
            left={t('Limit price')}
            right={`${limitPrice}`}
          />
          <BetweenText 
            left={t("Expires in")}
            right={t('assets.order.intraday')}
          />
          <BetweenText 
            left={
              <TooltipWithBorder tooltip={t('v2.tx.t311')}>
                {t('v2.tx.t31')}
              </TooltipWithBorder>
            }
            right={`${orderValue} ${feeSymbol}`}
          />
          
          <BetweenText 
            left={t("Network Fee")}
            right={`${networkFeeInNative} BNB`}
          />
          <BetweenText 
            left={
            <div className="flex items-center gap-1 cursor-pointer"
              onClick={() => {
                setShowDetails(!showDetails)
              }}
            >
              <div className="">{t('v2.tx.t28')}</div>
              <LazyImage src="/images/v2/icons/arrow-down.png" className={cn(
                "w-3 h-3",
                showDetails ? 'transform rotate-180' : ''
              )} />
            </div>}
            right={`${estimatedFee} ${feeSymbol}`}
          />
          {
            showDetails && (
              <div className="pl-2 bg-[#1A1B1E] pr-2 py-[6px] rounded-[4px] space-y-1">
                <BetweenText 
                  left={
                    <TooltipWithBorder tooltip={t('v2.tx.t321')}>
                      {t('v2.tx.t32')}
                    </TooltipWithBorder>
                  }
                  right={`${brokerageFee} ${feeSymbol}`}
                />
                <BetweenText 
                  left={
                    <TooltipWithBorder tooltip={t('v2.tx.t331')}>
                      {t('v2.tx.t33')}
                    </TooltipWithBorder>
                  }
                  right={`${tradingActivityFee} ${feeSymbol}`}
                />
                <BetweenText 
                  left={
                    <TooltipWithBorder tooltip={t('v2.tx.t341')}>
                      {t('v2.tx.t34')}
                    </TooltipWithBorder>
                  }
                  right={`${platformFee} ${feeSymbol}`}
                />
              </div>
            )
          }
        </div>
        <div className="h-[1px] bg-[#1A1A1A] my-4"></div>
        <BetweenText 
          left={<div className="text-[14px] font-normal text-white">{action === 'buy' ? t('v2.tx.t26') : t('v2.tx.t27')}</div>}
          right={<div className="text-[14px] font-normal text-white">{allFee}</div>}
        />
        <Button className="mt-3 w-full h-[40px] rounded-[8px] text-[14px]"
          onClick={() => {
            setShowConfirm(!innerShow)
            onClick ? onClick() : null
          }}
        >{t('Confirm')}</Button>
        <div className="mt-3 flex items-center gap-1">
          <CheckBox 
            onChange={e => {
              setInnerShow(e)
            }}
          />
          <span className=" text-[#9DA3AF] text-[14px] font-normal relative top-[1px]">{t('v2.tx.t35')}</span>
        </div>
      </div>
    )
  }
)

export {
  OrderConfirm
}