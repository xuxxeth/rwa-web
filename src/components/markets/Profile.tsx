import { useTranslation } from "@/hooks/useTranslation"
import { memo, useEffect, useRef, useState } from "react"
import { StatisticsItem } from "./StatisticsItem"
import { cn } from "@/lib/utils"
import { useTradeStore } from "@/stores/tradeStore"
import { baseApi } from "@/service/base/api"
import type { IProfile } from "@/service/base/types"
import { NumberText } from "../number-text"
import { TopTen } from "./TopTen"
import { ProfileTitle } from "./ProfileTitle"

const Profile = memo(
  ({ from }: {from?: string}) => {
    const { t } = useTranslation()
    const itemClass = from === 'market' ? 'text-[16px] py-4' : ''
    const inputToken = useTradeStore(state => state.inputToken)
    const initRef = useRef(false)
    const [profileData, setProfileData] = useState<IProfile>()

    useEffect(() => {
      if (inputToken?.stockId && !initRef.current) {
        initRef.current = true
        baseApi.getProfile(inputToken.stockId)
          .then(res => {
            console.log(res)
            setProfileData(res?.data || {})
          })
      }
      
    }, [inputToken?.stockId])

    return (
      <>
        <div className=" text-white mt-8">
          <ProfileTitle title={t('Profile')} className=" my-6" />
          <div className=" grid grid-cols-4 gap-x-4 mb-2">
            <StatisticsItem className={cn(
              "border-t",
              itemClass
            )} label={t('Company name')}>
              <NumberText text={profileData?.companyName} />
            </StatisticsItem>
            <StatisticsItem className={cn(
              "border-t",
              itemClass
            )} label={t('Listing date')}>
              <NumberText text={profileData?.listingDate} />
            </StatisticsItem>
            <StatisticsItem className={cn(
              "border-t",
              itemClass
            )} label={t('Chairman')}>
              <NumberText text={profileData?.chairman} />
            </StatisticsItem>
            <StatisticsItem className={cn(
              "border-t",
              itemClass
            )} label={t('Industry')}>
              <NumberText text={profileData?.industry} />
            </StatisticsItem>
          </div>
          <div className={cn(
            " text-[14px] font-normal leading-[22px] relative pt-2 px-2",
            itemClass,
            from === 'market' ? 'pt-6' : ''
          )}>
            <NumberText text={profileData?.introduction} />
            {/* <div className="text-[#1A85FF] text-[16px] absolute bottom-0 right-0 cursor-pointer">{t('Read more')}</div> */}
          </div>
          {/* <div className="h-[200px]">

          </div> */}
        </div>
        <TopTen topTen={profileData?.topTenShareholders || []} />
      </>
      
    )
  }
)

export { Profile }