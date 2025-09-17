import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "./CurrencyInput";
import { memo } from "react";

type CurrencyInputPanelProps = {
  mode?: string; // in | out
  label?: string
}

const CurrencyInputPanel = memo(
  ({mode, label}: CurrencyInputPanelProps) => {
    return (
      <div className={cn(
        "bg-[#06070A] p-4 rounded-[16px] border border-[#06070A]",
        mode === "out" ? "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0)]" : ""
      )}>
        <div className="text-[#6C86AD] text-base font-light mb-[10px]">{label || ''}</div>
        <CurrencyInput 
          />
        {
          mode === 'in' && 
            <div className=" mt-1 py-[6px] font-light text-[#6C86AD] text-[14px] flex items-center justify-between">
              <div className="">≈ $0.00</div>
              <div>Balance: 1,000 USDT</div>
            </div>
        }
        {
          mode === 'out' && 
            <div className=" mt-1 py-[6px] font-light text-[#6C86AD] text-[14px] flex items-center justify-between">
              <div className="">≈ $0.00</div>
              <div>Holdings: 0</div>
            </div>
        }
        
      </div>
    )
  }
)

export { CurrencyInputPanel }