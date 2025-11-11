import { useTranslation } from "@/hooks/useTranslation";
import { memo } from "react";

const ErrorChildren = memo(
  () => {
    const { t } = useTranslation()
    return (
      <div className="text-white flex justify-center items-center h-screen ">
        <h2>{t('pageError')}</h2>
      </div>
    )
  }
)

export { ErrorChildren }