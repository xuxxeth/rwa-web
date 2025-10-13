
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

type CurrencyInputPanelProps = {
  mode?: string; // in | out
  from?: string
  label?: string
  placeholder?: string
  value?: string
  regex?: string
  isInsufficient?: boolean
  onCurrencyClick?: () => void
  onUserInput?: (value: string) => void
}

const CurrencyInputPanel = memo(
  ({ mode = 'in', label, placeholder, value, from, regex, isInsufficient, onUserInput }: CurrencyInputPanelProps) => {
    const inputToken = useTradeStore(state => state.inputToken)
    const outputToken = useTradeStore(state => state.outputToken)
    const updateInputToken = useTradeStore(state => state.updateInputToken)
    const updateOutputToken = useTradeStore(state => state.updateOutputToken)

    const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)

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
        "bg-[#06070A] p-4 rounded-[16px] border border-[#06070A]",
        mode === "out" ? "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0)]" : "",
        inputFocus ? "border-[#FFFFFF]" : ""
      )}>
        <div className={cn(
          "text-[#6C86AD] font-light mb-[10px]",
          from === 'markets' ? 'text-[14px]' : 'text-[16px]'
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
          mode === 'in' && 
            <div className=" mt-1 py-[6px] font-light text-[#6C86AD] text-[14px] flex items-center justify-between">
              <div className="">≈ $0.00</div>
              <div>Avbl: <span className={cn(
                "",
                isInsufficient ? "text-[#FF593C]" : ""
              )}>{formatTokenAmountWithCommas(inputTokenBalance?.balance || '0')} {inputToken?.symbol || ' '}</span></div>
            </div>
        }
        {
          mode === 'out' && 
            <div className=" mt-1 py-[6px] font-light text-[#6C86AD] text-[14px] flex items-center justify-between">
              <div className="">≈ $0.00</div>
              <div>Avbl: <span className={cn(
                "",
                isInsufficient ? "text-[#FF593C]" : ""
              )}>{formatTokenAmountWithCommas(outputTokenBalance?.balance || '0')} {outputToken?.symbol || ' '}</span></div>
            </div>
        }
        <DialogController
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
        <DialogController
          topFixed
          title={t("Select a token")}
          open={cTokenDialog.open}
          openChange={cTokenDialog.setOpen}
        > 
          <div>
            <TokenList
              onClick={(token) => {
                cTokenDialog.hide()
                updateOutputToken(token)
              }}
            />
          </div>
        </DialogController>
      </div>
    )
  }
)

export { CurrencyInputPanel }