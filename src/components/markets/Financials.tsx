import { memo } from "react"
import { ProfileTitle } from "./ProfileTitle"
import { useTranslation } from "@/hooks/useTranslation"

const Financials = memo(
  () => {
    const { t } = useTranslation()
    
    return (
      <div>
        <ProfileTitle title="Financials" className=" mt-10 mb-6" />
        <div className="text-[14px] font-medium mb-6 px-2">Main Indicators</div>
      </div>
    )
  }
)

export { Financials }