import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo } from "react"
import { StatisticsItem } from "./StatisticsItem"

const Statistics = memo(
  () => {
    const { t } = useTranslation()
    return (
      <div>
        <div className=" mt-6 font-medium text-[18px] mb-2">{t('Statistics')}</div>
        <div className=" grid grid-cols-4 gap-x-8">
          <StatisticsItem className="border-t" label={t('Mkt Cap')}>{'1372.35B'}</StatisticsItem>
          <StatisticsItem className="border-t" label={t('Total Share')}>{'3.22B'}</StatisticsItem>
          <StatisticsItem className="border-t" label={t('Circ. Shares')}>{'2.80B'}</StatisticsItem>
          <StatisticsItem className="border-t" label={t('Circ. Cap')}>{'1194.40B'}</StatisticsItem>
          <StatisticsItem label={t('P/E (TTM)')}>{'230.96'}</StatisticsItem>
          <StatisticsItem label={t('P/E (Static)')}>{'191.86'}</StatisticsItem>
          <StatisticsItem label={t('P/B')}>{'17.75'}</StatisticsItem>
        </div>
      </div>
      
    )
  }
)

export { Statistics }