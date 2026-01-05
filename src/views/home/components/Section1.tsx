import { useId } from "react"
import { cn } from "@/utils"
import { useRouter } from "@/hooks/useRouter"
import { useTranslation } from "@/hooks/useTranslation"

export function Section1() {
  const { t } = useTranslation()
  
  const starList = [
    {path: '/images/icons/star/1.png'},
    {path: '/images/icons/star/2.png'},
    {path: '/images/icons/star/3.png'},
    {path: '/images/icons/star/4.png'},
    {path: '/images/icons/star/5.png'},
    {path: '/images/icons/star/6.png'},
    {path: '/images/icons/star/7.png'},
    // {path: './images/icons/star/8.png'},
  ]
  const _id = useId()
  const router = useRouter()
  return (
    <>
      {
        starList.map((star, index) => 
          <img key={`${_id}-${index}`} src={star.path} className={cn(
            "absolute",
            `star-${index + 1}`
          )} />
        )
      }
      <div className="w-full h-[750px] overflow-hidden relative text-white">
        <div className="w-[661px] h-[661px] circle-bg">
        </div>
        <div className=" relative z-30">
          <div className="text-[45px] font-medium text-center mt-[218px]">{t('home.text1')}</div>
          <div className="flex justify-center mt-2">
            <div className="text-[70px] leading-[70px] font-medium text-center w-[900px] ">{t('home.text2')}</div>
          </div>
          <div className="flex justify-center mt-8">
            <div className="text-[18px] leading-[26px] text-center w-[680px] ">{t('home.text3')}</div>
          </div>
          <div className="flex justify-center mt-[64px]">
            <div className="bg-[#FFFFFF] rounded-[100px] h-[64px] flex items-center justify-center px-[90px] text-[#1A1B23] font-semibold text-[18px] cursor-pointer"
              onClick={() => {
                router.push('/markets')
              }}
            >{t('home.button')}</div>
          </div>
        </div>
      </div>
    </>
    
  )
}