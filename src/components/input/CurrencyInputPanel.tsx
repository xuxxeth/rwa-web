
import { cn } from "@/lib/utils";
import { CurrencyInput } from "./CurrencyInput";
import { memo, useCallback, useState } from "react";

import { useShowDialog, DialogController } from '@/components/dialog/DialogController'
import { TokenList, tokenList } from "../token-list";
import { CTokenList, tokenList as ctokenList } from "../ctoken-list";

type CurrencyInputPanelProps = {
  mode?: string; // in | out
  label?: string
  onCurrencyClick?: () => void
}

const CurrencyInputPanel = memo(
  ({mode = 'in', label}: CurrencyInputPanelProps) => {
    const tokenDialog = useShowDialog()
    const cTokenDialog = useShowDialog()

    const handleCurrencyClick = useCallback(async () => {
      if (mode === 'in') {
        tokenDialog.setOpen(true)
      } else {
        cTokenDialog.setOpen(true)
      }
      
    }, [mode])

    const [inputToken, setInputToken] = useState(tokenList[0])
    const [outputToken, setOutputToken] = useState(ctokenList[0])
    return (
      <div className={cn(
        "bg-[#06070A] p-4 rounded-[16px] border border-[#06070A]",
        mode === "out" ? "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0)]" : ""
      )}>
        <div className="text-[#6C86AD] text-base font-light mb-[10px]">{label || ''}</div>
        <CurrencyInput 
          disabled={mode === 'out'}
          onCurrencyClick={handleCurrencyClick}
          selectedToken={mode === 'in' ? inputToken : outputToken}
        />
        {
          mode === 'in' && 
            <div className=" mt-1 py-[6px] font-light text-[#6C86AD] text-[14px] flex items-center justify-between">
              <div className="">≈ $0.00</div>
              <div>Balance: {inputToken.balance} {inputToken.symbol}</div>
            </div>
        }
        {
          mode === 'out' && 
            <div className=" mt-1 py-[6px] font-light text-[#6C86AD] text-[14px] flex items-center justify-between">
              <div className="">≈ $0.00</div>
              <div>Holdings: {outputToken.balance}</div>
            </div>
        }
        <DialogController
          topFixed
          title="Select a token"
          open={tokenDialog.open}
          openChange={tokenDialog.setOpen}
        > 
          <div>
            <TokenList
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
            <CTokenList 
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