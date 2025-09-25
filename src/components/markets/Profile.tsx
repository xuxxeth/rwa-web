import { useTranslation } from "@/hooks/useTranslation"
import { memo } from "react"
import { StatisticsItem } from "./StatisticsItem"

const Profile = memo(
  () => {
    const { t } = useTranslation()
    return (
      <div className=" text-white mt-8">
        <div className=" font-medium text-[18px] mb-2">{t('Profile')}</div>
        <div className=" grid grid-cols-4 gap-x-8 mb-2">
          <StatisticsItem className="border-t" label={t('Company name')}>{'Amazon'}</StatisticsItem>
          <StatisticsItem className="border-t" label={t('Listing date')}>{'29 Jun, 1994'}</StatisticsItem>
          <StatisticsItem className="border-t" label={t('Chairman')}>{'Jeffrey P. Bezos'}</StatisticsItem>
          <StatisticsItem className="border-t" label={t('Industry')}>{'Multiline Retail'}</StatisticsItem>
        </div>
        <div className=" text-[14px] font-normal leading-[24px] relative">
          Amazon.com, Inc. engages in the provision of online retail shopping services. It operates through the following business segments: North America, International, and Amazon Web Services (AWS). The North America segment includes retail sales of consumer products and subscriptions through International, and Amazon Internat North Internatio...
          <div className="text-[#1A85FF] text-[16px] absolute bottom-0 right-0 cursor-pointer">{t('Read more')}</div>
        </div>
        <div className="h-[200px]">

        </div>
      </div>
    )
  }
)

export { Profile }