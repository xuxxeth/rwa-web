import { SwitchArrow } from "@/components/switch-arrow";
import { CurrencyInputPanel } from "@/components/input/CurrencyInputPanel";
import { useTranslation } from "@/hooks/useTranslation";

export function ConverBody() {
  const { t } = useTranslation()
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
    </div>
  )
}