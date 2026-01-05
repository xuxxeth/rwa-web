import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo, useId, useState } from "react"
import { Button } from "../ui/button"

type ExpiresSettingProps = {
  onConfirm?: (value: number) => void
}

const ExpiresSetting = memo(
  ({ onConfirm }: ExpiresSettingProps) => {
    const { t } = useTranslation()
    const _id = useId()
    const [current, setCurrent] = useState(7)
    return (
      <div className="w-[300px]">
        <div className="my-8 flex items-center justify-between bg-[#10141C] rounded-[8px]">
          {
            [7, 15, 30].map((value, index) => {
              return (
                <div key={`${_id}-${index}`} className={cn(
                  "flex items-center justify-center h-[40px] px-5 text-white text-[14px] font-normal rounded-[8px] cursor-pointer",
                  current === value ? "bg-[#324054]" : ""
                )}
                  onClick={() => {
                    setCurrent(value)
                  }}
                >
                  {value} {t('days')}
                </div>
              )
            })
          }
          
        </div>
        <Button onClick={() => onConfirm && onConfirm(current)} className="w-full h-[40px] rounded-[16px]">{t('Confirm')}</Button>
      </div>
    )
  }
)

export { ExpiresSetting }