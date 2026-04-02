
import { cn } from "@/lib/utils";
import { CurrencyInput } from "./CurrencyInput";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useShowDialog, DialogController } from '@/components/dialog/DialogController'
import { CTokenList } from "../ctoken-list";
import { useTokens } from "@/hooks/useTokens";
import { useRwas } from "@/hooks/useRwaBalances";
import { useTranslation } from "@/hooks/useTranslation";
import { useTradeStore } from "@/stores/tradeStore";
import { PriceChangeTab } from "../markets/PriceChangeTab";
import { useRouter } from "@/hooks/useRouter";
import { TradeType } from "ca-common-web";

type CurrencyInputPanelProps = {
  isMarket?: boolean
  tradeType?: TradeType
  action?: string; // buy | sell
  mode?: string; // in | out
  from?: string
  label?: string
  placeholder?: string
  value?: string
  regex?: string | RegExp
  isInsufficient?: boolean
  onCurrencyClick?: () => void
  onUserInput?: (value: string) => void
  handleChangePrice?: (priceType: number) => void
}

const CurrencyInputPanel = memo(
  ({ mode = 'in', label, placeholder, value, from, regex, isInsufficient, tradeType, isMarket, onUserInput, handleChangePrice }: CurrencyInputPanelProps) => {
    const router = useRouter()
    const inputToken = useTradeStore(state => state.inputToken)
    const outputToken = useTradeStore(state => state.outputToken)
    const updateInputToken = useTradeStore(state => state.updateInputToken)
    const updateOutputToken = useTradeStore(state => state.updateOutputToken)

    const tokenDialog = useShowDialog()
    const cTokenDialog = useShowDialog()
    const tokenList = useTokens()
    const rwaList = useRwas()

    const { t } = useTranslation()
    const [inputFocus, setInputFocus] = useState(false)

    const handleCurrencyClick = useCallback(async () => {
      if (mode === 'in') {
        tokenDialog.setOpen(true)
      } else {
        cTokenDialog.setOpen(true)
      }
      
    }, [mode])

    useEffect(() => {
      
      if (!router.params.symbol) {
        rwaList[0] && updateInputToken(rwaList[0])
      } else {
        // 通过symbol查找对应的token
        const _rwa = rwaList.find(rwa => rwa.symbol.toLowerCase() === router.params.symbol?.toLowerCase())
        _rwa && updateInputToken(_rwa)
      }
    }, [rwaList.length, inputToken, router.params])

    useEffect(() => {
      if (tokenList[0]) {
        updateOutputToken(tokenList[0])
      }
    }, [tokenList.length])

    return (
      <div className={cn(
        "p-3 rounded-[8px] border border-[#232427] bg-[#131416]",
        mode === "out" ? "border-[#232427] bg-[#131416]" : !isMarket ? "border-[#1A1B1E] bg-[#1A1B1E]" : "",
        inputFocus ? "border-[rgba(156,255,58,0.8)]" : ""
      )}>
        <div className={cn(
          "text-[#9CA3AD] font-normal text-[12px] mb-2",
        )}>{label || ''}</div>
        {
          tradeType === TradeType.MARKET && mode === 'price' ? (
            <div className="text-[#9DA3AF] text-[14px] pr-1 h-[23px]">{t('v3.t1')}</div>
          ) : (
            <CurrencyInput 
              isInsufficient={isInsufficient}
              value={value}
              placeholder={placeholder}
              disabled={mode === 'out'}
              from={from}
              mode={mode}
              regex={regex}
              onUserInput={onUserInput}
              onCurrencyClick={handleCurrencyClick}
              selectedToken={mode === 'in' ? inputToken : outputToken}
              onFocus={focus => {
                setInputFocus(focus)
              }}
            />
          )
        }
        
        {
          mode === 'price' && !isMarket && <PriceChangeTab from="lite-trade" tradeType={tradeType} onChange={(priceType) => handleChangePrice && handleChangePrice(priceType)} />
        }
        
        <DialogController
          className="pr-1 pl-0"
          headerClassName="px-4"
          topFixed
          title={t("Select a token")}
          open={tokenDialog.open}
          openChange={tokenDialog.setOpen}
        > 
          <div>
            
            <CTokenList 
              onClick={(token) => {
                tokenDialog.hide()
                // updateInputToken(token)
                router.push('/lite-trade/' + token.symbol)
              }}
            />
          </div>
        </DialogController>
        
      </div>
    )
  }
)

export { CurrencyInputPanel }