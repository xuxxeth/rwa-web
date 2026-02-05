
import { cn } from "@/lib/utils";
import { CurrencyInput } from "./CurrencyInput";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useShowDialog, DialogController } from '@/components/dialog/DialogController'
import { TokenList } from "../token-list";
import { CTokenList } from "../ctoken-list";
import { useTokens } from "@/hooks/useTokens";
import { useRwas } from "@/hooks/useRwaBalances";
import { formatTokenAmountWithCommas, } from "@/utils/format";
import { useTranslation } from "@/hooks/useTranslation";
import { useTradeStore } from "@/stores/tradeStore";
import { useBaseStore } from "@/stores/baseStore";
import { symbolToLower } from "@/utils";
import { useTokenBalance } from "@/hooks/useTokenBalances";
import { PriceChangeTab } from "../markets/PriceChangeTab";

type CurrencyInputPanelProps = {
  action?: string; // buy | sell
  mode?: string; // in | out
  from?: string
  label?: string
  placeholder?: string
  value?: string
  regex?: string
  isInsufficient?: boolean
  onCurrencyClick?: () => void
  onUserInput?: (value: string) => void
  handleChangePrice?: (priceType: number) => void
}

const CurrencyInputPanel = memo(
  ({ mode = 'in', label, placeholder, value, from, regex, isInsufficient, onUserInput, handleChangePrice }: CurrencyInputPanelProps) => {
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
    
    const inputTokenBalance = useTokenBalance(inputToken?.symbol || '') 
    const outputTokenBalance = useTokenBalance(outputToken?.symbol || '') 

    useEffect(() => {
      if (rwaList[0] && !inputToken) {
        updateInputToken(rwaList[0])
      }
    }, [rwaList.length, inputToken])

    useEffect(() => {
      if (tokenList[0]) {
        updateOutputToken(tokenList[0])
      }
    }, [tokenList.length])

    return (
      <div className={cn(
        "p-3 rounded-[8px] border border-[rgba(255,255,255,0.00005)] bg-[#1A1B1E]",
        mode === "out" ? "border-[#232427] bg-[#131416]" : "",
        inputFocus ? "border-[rgba(156,255,58,0.8)]" : ""
      )}>
        <div className={cn(
          "text-[#9CA3AD] font-normal text-[12px] mb-2",
        )}>{label || ''}</div>
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
        {
          mode === 'price' && <PriceChangeTab from="lite-trade" onChange={(priceType) => handleChangePrice && handleChangePrice(priceType)} />
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
                updateInputToken(token)
              }}
            />
          </div>
        </DialogController>
        
      </div>
    )
  }
)

export { CurrencyInputPanel }