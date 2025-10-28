import { useTranslation } from "@/hooks/useTranslation"
import { useId } from "react"

export default function Section5() {
  const { t } = useTranslation()
  
  const ptList = [
    {logo: '/images/home/partners/pt_pyth.png', width: 172},
    {logo: '/images/home/partners/pt_usmart.png', width: 184},
    {logo: '/images/home/partners/pt_slo.png', width: 192},
    {logo: '/images/home/partners/pt_ent.png', width: 210},
    {logo: '/images/home/partners/pt_arisk.png', width: 140},
    {logo: '/images/home/partners/pt_megvii.png', width: 156},
  ]
  const _id = useId()
  return (
    <div className="py-[56px] flex justify-center items-center flex-col text-white">
      <div className="text-[36px] font-medium">{t('home.text18')}</div>
      <div className="text-[18px] font-normal mt-6 text-[rgba(255,255,255,0.8)]">{t('home.text19')}</div>
      <div className=" max-w-[1440px] mask-auto flex items-center flex-wrap gap-x-8 mt-[46px]">
        {
          ptList.map((pt, index) => {
            return (
              <img key={`${_id}-${index}`} src={pt.logo} style={{width: pt.width ? pt.width + 'px' : 'auto'}} alt="" />
            )
          })
        }
      </div>
    </div>
  )
}