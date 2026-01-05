import { useTranslation } from "@/hooks/useTranslation"
import { useId } from "react"

export default function Section4() {
  const { t } = useTranslation()
  
  const descList = [
    {
      title: t('home.text10'),
      desc: [
        {text: t('home.text11'), icon: '/images/home/icon_bt_1.png'},
        {text: t('home.text12'), icon: '/images/home/icon_bt_2.png'},
        {text: t('home.text13'), icon: '/images/home/icon_bt_3.png'},
      ]
    },
    {
      title: t('home.text14'),
      desc: [
        {text: t('home.text15'), icon: '/images/home/icon_up_1.png'},
        {text: t('home.text16'), icon: '/images/home/icon_up_2.png'},
        {text: t('home.text17'), icon: '/images/home/icon_up_3.png'},
      ]
    }
  ]
  const _id = useId()
  const _subId = useId()

  return (
    <div className=" mt-[130px] text-white relative overflow-hidden pb-[130px]">
      <div className="text-[36px] font-medium capitalize text-center">{t('home.text8')}</div>
      <div className="flex justify-center">
        <div className=" font-normal text-center text-[#D4D4D4] text-[18px] capitalize w-[906px] mt-6">{t('home.text9')}</div>
      </div>
      <div className="mt-[46px] flex justify-center">
        <div className=" grid grid-cols-2 gap-x-[87px]">
          {
            descList.map((desc, index) => {
              return (
                <div key={`${_id}-${index}`} className="bg-[rgba(255,255,255,0.04)] min-w-[584px] rounded-xl p-[56px]">
                  <div className="text-[28px] font-semibold">{desc.title}</div>
                  <div className="bg-[#9CFF3A] h-[2px] w-[60px] rounded-[6px] mt-5"></div>
                  <div className=" flex flex-col gap-y-[54px] mt-[54px]">
                    {
                      desc.desc.map((descItem, index) => {
                        return (
                          <div key={`${_subId}-${index}`} className="flex items-center text-[rgba(255,255,255,0.8)]">
                            <img src={descItem.icon} className="w-[61px] h-[61px]" alt="" />
                            <div className="text-[18px] text-[rgba(255,255,255,0.8)] ml-[30px]">{descItem.text}</div>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>

      <img src="/images/home/section4.png" className="w-[447px] h-[895px] absolute right-0 bottom-0 -mb-[447px]" alt="" />
    </div>
  )
}