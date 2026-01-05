import { useTranslation } from "@/hooks/useTranslation"

export default function Section3() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center mt-[100px] relative">
      <div className="circle-bg2 absolute top-[50%] -translate-y-[50%] -left-[40%]">

      </div>
      <div className="w-[1440px] h-[367px] relative">
        <img src="/images/home/section3.png" className="w-full h-[367px] absolute top-0 left-0 right-0" alt="" />
        <div className=" relative z-10 h-full flex items-center text-white pl-[158px]">
          <div className="w-[520px]">
            <div className="text-[36px] font-medium ">{t('home.text6')}</div>
            <div className="text-[16px] mt-4">{t('home.text7')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}