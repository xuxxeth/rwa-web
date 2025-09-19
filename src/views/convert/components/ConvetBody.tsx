import { SwitchArrow } from "@/components/switch-arrow";
import { CurrencyInputPanel } from "@/components/input/CurrencyInputPanel";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EstimatedInfo } from "./EstimatedInfo";
import { cn } from "@/lib/utils";
import { FAQ } from "./FAQ";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { ConnectButtonText } from "@/components/button/ConnectButtonText";

export function ConverBody() {
  const { t } = useTranslation()
  const [disabled, setDisabled] = useState(false)
  const { account } = useActiveWeb3()

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

      {
        !account ? <ConnectButtonText /> :
        <Button className={cn(
          "w-full mt-8",
        )}
          disabled={disabled}
        >
          { disabled ? 'Not enough USDT' : 'Buy' }
          
        </Button>
      }
      
      <FAQ />
    </div>
  )
}