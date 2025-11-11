import { useI18nLanguage, useTranslation } from "@/hooks/useTranslation"
import { memo, useEffect, useRef, useState } from "react"
import { StatisticsItem } from "./StatisticsItem"
import { cn } from "@/lib/utils"
import { useTradeStore } from "@/stores/tradeStore"
import { baseApi } from "@/service/base/api"
import type { IProfile } from "@/service/base/types"
import { NumberText } from "../number-text"
import { TopTen } from "./TopTen"
import { ProfileTitle } from "./ProfileTitle"
import { formatDateToShortEN } from "@/utils/format"
import { EllipsisText } from "../ellipsis-text"

const Profile = memo(
  ({ from }: {from?: string}) => {
    const { t, i18n } = useTranslation()
    const lang = useI18nLanguage(i18n)
    const itemClass = from === 'market' ? 'text-[16px] py-4' : ''
    const inputToken = useTradeStore(state => state.inputToken)
    const initRef = useRef(false)
    const [profileData, setProfileData] = useState<IProfile>()

    useEffect(() => {
    // token 或语言变化时重置初始化标记
    initRef.current = false;
  }, [inputToken?.stockId, i18n.language]);

    useEffect(() => {
      if (!inputToken?.stockId) return;

      if (!initRef.current) {
        initRef.current = true; // 标记已经初始化过
        baseApi.getProfile(inputToken.stockId).then((res) => {
          setProfileData(res?.data || {});
        });
      }
      
    }, [inputToken?.stockId, i18n.language])

    return (
      <>
        <div className=" text-white mt-8">
          <ProfileTitle title={t('Profile')} className=" my-6" />
          <div className=" grid grid-cols-2 gap-x-4 mb-2 items-start">
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
              <NumberText text={formatDateToShortEN(profileData?.listingDate || '')} />
            </StatisticsItem>
            <StatisticsItem className={cn(
              "border-t",
              itemClass
            )} label={t('Industry')}>
              {/* <NumberText text={profileData?.industry} /> */}
              <EllipsisText text={profileData?.industry} maxWidth={460} />
            </StatisticsItem>
            <StatisticsItem className={cn(
              "border-t",
              itemClass
            )} label={t('Chairman')}>
              <NumberText text={profileData?.chairman} />
            </StatisticsItem>
            
          </div>
          <div className={cn(
            " text-[14px] font-normal leading-[22px] relative pt-2 px-2",
            itemClass,
          )}>
            <NumberText text={profileData?.introduction} />
            {/* <div className="text-[#1A85FF] text-[16px] absolute bottom-0 right-0 cursor-pointer">{t('Read more')}</div> */}
          </div>
          {/* <div className="h-[200px]">

          </div> */}
        </div>
        {
          from === 'market' && <TopTen topTen={profileData?.topTenShareholders || []} />
        }
        
      </>
      
    )
  }
)

export { Profile }