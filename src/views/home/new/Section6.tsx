import { LazyImage } from "@/components/image/LazyImage";
import { TitlePrimary } from "@/components/title-primary";
import { useTranslation } from "@/hooks/useTranslation";
import { memo, useId, useMemo } from "react";

const Section6 = memo(
  () => {
    const { t } = useTranslation()
    
    const partnerList = useMemo(() => {
      return [
        {
          logo: '/images/home/new/usmart.svg',
          title: t('newHome.t28'),
          desc: t('newHome.t29'),
          web: 'www.usmart.sg'
        },
        {
          logo: '/images/home/new/slowmist.png',
          title: t('newHome.t30'),
          desc: t('newHome.t31'),
          web: 'slowmist.com'
        },
        {
          logo: '/images/home/new/megvii.svg',
          title: t('newHome.t32'),
          desc: t('newHome.t33'),
          web: 'faceplusplus.com.cn'
        },
        {
          logo: '/images/home/new/pyth.png',
          title: t('newHome.t34'),
          desc: t('newHome.t35'),
          web: 'www.pyth.network'
        },
        {
          logo: '/images/home/new/arisk.png',
          title: t('newHome.t36'),
          desc: t('newHome.t37'),
          web: 'arisk.io'
        },
      ]
    }, [t])

    const _id = useId()
    return (
      <div className="p-[93px] flex justify-center text-white">
        <div className="w-[1254px] min-h-[526px] relative"
        >
          <LazyImage src="/images/home/new/sec6_bg.png" className="w-full absolute left-0 top-0" />
          <div className=" relative py-[28px] px-[60px]">
            <div className="w-full flex justify-center">
              <TitlePrimary className=" font-medium text-[36px] text-center leading-[100%]">
                {t('newHome.t27')}
              </TitlePrimary>
            </div>
           
            <div className=" flex items-center justify-center mt-[40px] gap-x-[40px]">
              {
                partnerList.slice(0, 3).map((item, index) => {
                  return (
                    <div key={`${_id}-${index}`} className="border-[rgba(255,255,255,0.1)] border rounded-[16px] w-[352px] min-h-[287px] p-10">
                      <LazyImage src={item.logo} />
                      <div className="mt-5 text-[16px] font-semibold">{item.title}</div>
                      <div className="mt-5 text-[16px] leading-[20px] font-normal text-[rgba(255,255,255,0.6)]">{item.desc}</div>
                      <a href={item.web} target="_blank">
                        <div className=" flex mt-4 items-center cursor-pointer">
                          <div className=" underline text-[14px] font-normal">{item.web}</div>
                          <LazyImage src="/images/home/new/link_white.png" className="w-5 ml-1" />
                        </div>
                      </a>
                      
                    </div>
                  )
                })
              }
            </div>
            <div className=" flex items-center justify-center mt-[40px] gap-x-[40px]">
              {
                partnerList.slice(3, 5).map((item, index) => {
                  return (
                    <div key={`${_id}-${index}`} className="border-[rgba(255,255,255,0.1)] border rounded-[16px] w-[548px] min-h-[287px] p-10">
                      <LazyImage src={item.logo} />
                      <div className="mt-5 text-[16px] font-semibold">{item.title}</div>
                      <div className="mt-5 text-[16px] leading-[20px] font-normal text-[rgba(255,255,255,0.6)]">{item.desc}</div>
                      <a href={item.web} target="_blank">
                        <div className=" flex mt-4 items-center cursor-pointer">
                          <div className=" underline text-[14px] font-normal">{item.web}</div>
                          <LazyImage src="/images/home/new/link_white.png" className="w-5 ml-1" />
                        </div>
                      </a>
                      
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default Section6