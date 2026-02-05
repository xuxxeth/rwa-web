
import { cn } from "@/lib/utils";
import { CurrencyInput } from "./CurrencyInput";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useShowDialog, DialogController } from '@/components/dialog/DialogController'
import { CTokenList } from "../../ctoken-list";
import { useTokens } from "@/hooks/useTokens";
import { useRwas } from "@/hooks/useRwaBalances";
import { useTranslation } from "@/hooks/useTranslation";
import { useTradeStore } from "@/stores/tradeStore";

type CurrencyInputPanelProps = {
  mode?: string; // in | out
  from?: string
  label?: string
  placeholder?: string
  value?: string
  regex?: string
  isInsufficient?: boolean
  type?: string; // price | size
  onCurrencyClick?: () => void
  onUserInput?: (value: string) => void
}

const CurrencyInputPanel = memo(
  ({ mode = 'in', type, label, placeholder, value, from, regex, isInsufficient, onUserInput }: CurrencyInputPanelProps) => {
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
      }
      
    }, [mode])

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
        "bg-[#1A1B1E] h-[38px] pl-3 pr-2 border border-[#1A1B1E] flex items-center justify-between",
        mode === "out" ? "border-[#232427] bg-[#131416] rounded-[4px] " : "",
        type === "size" ? "rounded-[4px]" : "rounded-t-[4px]",
        inputFocus ? " border-[rgba(156,255,58,0.8)]" : ""
      )}>
        <div className={cn(
          "text-[#9DA3AF] font-normal shrink-0",
          from === 'markets' ? 'text-[14px]' : 'text-[14px]'
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