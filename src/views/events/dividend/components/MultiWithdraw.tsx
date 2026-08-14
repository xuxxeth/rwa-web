import { ChainSelect } from "@/components/chain-select"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/useTranslation"
import type { IChain } from "@/service/base/types"
import { useState } from "react"


function MultiWithdraw({
  onStepChange
}: {
  onStepChange?: (step: number) => void
}) {
  const { t } = useTranslation()
  // 1: 批量领取，2: 确认领取
  const [step, setStep] = useState(1)
  const [selectedChain, setSelectedChain] = useState<IChain | null>(null)

  return (
    <div className=" flex items-center gap-x-3">
      <ChainSelect 
        onChange={chain => {
          setSelectedChain(chain)

        }}
      />
      <div className="bg-[#232427] w-px h-6"></div>
      {
        step === 2 && (
          <Button 
            outline
            className="border-[#282A2F] h-[32px] text-[#C7CCD6] text-[14px] font-normal bg-[rgba(0,0,0,0)] rounded-[6px] min-w-[80px]
            "
            onClick={e => {
              setStep(1)
              onStepChange?.(1)
            }}
          >
            {t('events.t82')}
          </Button>
        )
      }
      <Button 
        outline
        className="border-[#282A2F] h-[32px] text-[#C7CCD6] text-[14px] font-normal bg-[rgba(0,0,0,0)] rounded-[6px] min-w-[80px]
         hover:border-[rgba(156,255,58,0.2)] hover:text-[#9CFF3A]
        "
        disabled={selectedChain?.name === 'ALL' || !selectedChain}
        onClick={e => {
          e.stopPropagation()
          if (step === 1) {
            setStep(2)
            onStepChange?.(2)
          }
        }}
      >
        {step === 1 ? t('events.t80') : t('events.t81')}
      </Button>
    </div>
  )
}


export { MultiWithdraw }