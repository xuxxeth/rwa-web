import { useTranslation } from "@/hooks/useTranslation"


export function ClaimButton({
  disabled
}: {
  disabled?: boolean
}) {
  const { t } = useTranslation()


  return (
    <button className="
      bg-[rgba(156,255,58,0.08)] border border-[rgba(156,255,58,0.2)] rounded-[6px] h-[32px] min-w-[72px] px-4 flex justify-center items-center text-[#9CFF3A] text-[12px] 
      disabled:bg-[#232427] disabled:border-[#232427] disabled:text-[#41464F] "
      disabled={disabled}
      >
      {t('events.t63')}
    </button>
  )
}