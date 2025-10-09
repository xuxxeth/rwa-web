
import { cn } from "@/lib/utils";
import { CurrencyInput } from "./CurrencyInput";
import { memo, useCallback, useEffect, useState } from "react";

import { useShowDialog, DialogController } from '@/components/dialog/DialogController'
import { TokenList } from "../token-list";
import { CTokenList, type CTokenProps } from "../ctoken-list";
import { useTokens } from "@/hooks/useTokens";
import { useRwas } from "@/hooks/useRwaBalances";
import type { IRwa, IToken } from "@/service/base/types";

type CurrencyInputPanelProps = {
  mode?: string; // in | out
  from?: string
  label?: string
  placeholder?: string
  value?: string
  regex?: string
  onCurrencyClick?: () => void
  onUserInput?: (value: string) => void
}

const CurrencyInputPanel = memo(
  ({ mode = 'in', label, placeholder, value, from, regex, onUserInput }: CurrencyInputPanelProps) => {
    const tokenDialog = useShowDialog()
    const cTokenDialog = useShowDialog()
    const tokenList = useTokens()
    const rwaList = useRwas()

    const handleCurrencyClick = useCallback(async () => {
      if (mode === 'in') {
        tokenDialog.setOpen(true)
      } else {
        cTokenDialog.setOpen(true)
      }
      
    }, [mode])

    const [inputToken, setInputToken] = useState<IRwa>()
    const [outputToken, setOutputToken] = useState<IToken>()
    
    useEffect(() => {
      if (rwaList[0]) {
        setInputToken(rwaList[0])
      }
      if (tokenList[0]) {
        setOutputToken(tokenList[0])
      }
    }, [rwaList, tokenList])

    return (
      <div className={cn(
        "bg-[#06070A] p-4 rounded-[16px] border border-[#06070A]",
        mode === "out" ? "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0)]" : ""
      )}>
        <div className={cn(
          "text-[#6C86AD] font-light mb-[10px]",
          from === 'markets' ? 'text-[14px]' : 'text-[16px]'
        )}>{label || ''}</div>
        <CurrencyInput 
          value={value}
          placeholder={placeholder}
          disabled={mode === 'out'}
          from={from}
          mode={mode}
          regex={regex}
          onUserInput={onUserInput}
          onCurrencyClick={handleCurrencyClick}
          selectedToken={mode === 'in' ? inputToken : outputToken}
        />
        {
          mode === 'in' && 
            <div className=" mt-1 py-[6px] font-light text-[#6C86AD] text-[14px] flex items-center justify-between">
              <div className="">≈ $0.00</div>
              <div>Avbl: {inputToken?.balance || '0'} {inputToken?.symbol || ' '}</div>
            </div>
        }
        {
          mode === 'out' && 
            <div className=" mt-1 py-[6px] font-light text-[#6C86AD] text-[14px] flex items-center justify-between">
              <div className="">≈ $0.00</div>
              <div>Avbl: {outputToken?.balance || '0'} {outputToken?.symbol || ' '}</div>
            </div>
        }
        <DialogController
          topFixed
          title="Select a token"
          open={tokenDialog.open}
          openChange={tokenDialog.setOpen}
        > 
          <div>
            
            <CTokenList 
              onClick={(token) => {
                tokenDialog.hide()
                setInputToken(token)
              }}
            />
          </div>
        </DialogController>
        <DialogController
          topFixed
          title="Select a token"
          open={cTokenDialog.open}
          openChange={cTokenDialog.setOpen}
        > 
          <div>
            <TokenList
              onClick={(token) => {
                cTokenDialog.hide()
                setOutputToken(token)
              }}
            />
          </div>
        </DialogController>
      </div>
    )
  }
)

export { CurrencyInputPanel }