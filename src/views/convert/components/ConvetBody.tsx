import { SwitchArrow } from "@/components/switch-arrow";
import { CurrencyInputPanel } from "@/components/input/CurrencyInputPanel";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EstimatedInfo } from "./EstimatedInfo";
import { cn } from "@/lib/utils";
import { FAQ } from "./FAQ";

export function ConverBody() {
  const { t } = useTranslation()
  const [disabled, setDisabled] = useState(false)
  const [connected, setConnected] = useState(false)


  return (
    <div className="mt-4">
      <CurrencyInputPanel 
        label={t('You Pay')}
        
      />
      <SwitchArrow />
      <CurrencyInputPanel
        mode="out"
        label={t('You Receive')}
      />
      <EstimatedInfo />
      <Button className={cn(
        "w-full mt-8",
        !connected ? ' bg-white text-black' : ''
      )}
        disabled={disabled}
      >
        { connected ? disabled ? 'Not enough USDT' : 'Buy' : 'Connect wallet' }
        
      </Button>
      <FAQ />
    </div>
  )
}