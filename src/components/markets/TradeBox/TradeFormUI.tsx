import { CurrencyInputPanel } from "@/components/v2/input/CurrencyInputPanel"
import { CurrencyInputPanel as CurrencyInputPanelLite } from "@/components/input/CurrencyInputPanel"
import { cn } from "@/lib/utils"
import { formatTokenAmountWithCommas } from "@/utils"
import { useTranslation } from "@/hooks/useTranslation"
import { PriceChangeTab } from "../PriceChangeTab"
import { USDTSelect } from "../../usdt-select"
import { ConvertAction } from "../ConvertAction"
import { EstimatedInfo } from "../../../views/lite-trade/components/EstimatedInfo"
import { DialogController, useShowDialog } from "@/components/dialog/DialogController"
import { ExpiresSetting } from "../../expires-setting"
import { TradeType } from "ca-common-web"
import { SessionTypeSelect } from "@/components/session-type-select"

type TradeFormUIProps = {
  from?: string
  action: "buy" | "sell"
  tradeType: TradeType
  limitPrice: string
  inputSize: string
  orderValue: string
  allOrderValue: string
  isInsufficient: boolean
  isSellInsufficient: boolean
  account?: string
  inputTokenSymbol?: string
  outputTokenSymbol?: string
  inputTokenBalance?: string
  outputTokenBalance?: string
  estimatedFee: string
  networkFeeInNative: string
  expires: number
  onPriceChange: (value: string) => void
  onSizeChange: (value: string) => void
  onChangePriceType: (value: number) => void
}

export function TradeFormUI({
  from,
  action,
  tradeType,
  limitPrice,
  inputSize,
  orderValue,
  allOrderValue,
  isInsufficient,
  isSellInsufficient,
  account,
  inputTokenSymbol,
  outputTokenSymbol,
  inputTokenBalance,
  outputTokenBalance,
  estimatedFee,
  networkFeeInNative,
  expires,
  onPriceChange,
  onSizeChange,
  onChangePriceType,
}: TradeFormUIProps) {
  const { t } = useTranslation()
  const isMarket = tradeType === TradeType.MARKET
  return (
    <>
      {from === 'markets' && (
        <>
          {
            !isMarket && (
              <div className="mb-3">
                <SessionTypeSelect />
              </div>
            )
          }
          <CurrencyInputPanel
            tradeType={tradeType}
            value={limitPrice}
            from={from}
            mode="price"
            label={ isMarket ? t('v3.price') : t('v2.tx.t24')}
            onUserInput={onPriceChange}
          />
          {
              !isMarket && (
                <PriceChangeTab onChange={onChangePriceType} tradeType={tradeType} />
              )
          }
          
          <div className="h-3"></div>
          <CurrencyInputPanel
            tradeType={tradeType}
            value={inputSize}
            regex={/^(?:|[1-9]\d*)$/}
            from={from}
            type="size"
            label={t('v2.tx.t25')}
            placeholder={'0'}
            onUserInput={onSizeChange}
            isInsufficient={isSellInsufficient}
          />
          <div className="h-3"></div>
          <USDTSelect
            label={action === 'buy' ? t('v2.tx.t26') : t('v2.tx.t27')}
            orderValue={allOrderValue}
          />
        </>
      )}

      {from === 'lite-trade' && (
        <>
          {
            !isMarket && (
              <div className="mb-1">
                <SessionTypeSelect from="lite-trade" />
              </div>
            )
          }
          <CurrencyInputPanelLite
            isMarket={isMarket}
            tradeType={tradeType}
            value={limitPrice}
            from={from}
            mode="price"
            label={t('v2.tx.t24')}
            placeholder={t('Enter Limit Price')}
            onUserInput={onPriceChange}
            handleChangePrice={onChangePriceType}
          />
          <div className="h-1"></div>
          <div
            className={cn(
              "flex flex-col",
              action === 'buy' ? 'flex-col-reverse' : ' '
            )}
          >
            <CurrencyInputPanelLite
              value={inputSize}
              regex={/^(?:|[1-9]\d*)$/}
              from={from}
              label={action === 'sell' ? t('v2.tx.t26') : t('v2.tx.t27')}
              placeholder={t('Enter an amount')}
              onUserInput={onSizeChange}
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
      )}

      {account && (
        <div>
          <div className=" flex items-center justify-between text-[12px] mt-3 text-[#9DA3AF] px-3">
            <div>{t('avbl')}: </div>
            <div>
              <span className={cn("text-[#FFFFFF]", isInsufficient ? "text-[#CA3F64]" : "") }>
                {action === 'buy'
                  ? formatTokenAmountWithCommas(outputTokenBalance || '0')
                  : formatTokenAmountWithCommas(inputTokenBalance || '0')}
                <span className="ml-1">
                  {action === 'buy' ? outputTokenSymbol : inputTokenSymbol}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
