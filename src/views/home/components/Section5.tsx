import { useId } from "react"

export function Section5() {
  const ptList = [
    {logo: './images/home/pt_web3dev.png'},
    {logo: './images/home/pt_ploygon.png'},
    {logo: './images/home/pt_metamask.png'},
    {logo: './images/home/pt_the.png'},
    {logo: './images/home/pt_ploygon.png'},
  ]
  const _id = useId()
  return (
    <div className="py-[56px] flex justify-center items-center flex-col text-white">
      <div className="text-[44px] font-semibold">Strategic Partners</div>
      <div className="text-[18px] mt-6 text-[rgba(255,255,255,0.8)]">Collaborated with industry-leading institutions</div>
      <div className=" max-w-[1440px] mask-auto flex items-center flex-wrap gap-x-8 mt-[46px]">
        {
          ptList.map((pt, index) => {
            return (
              <img key={`${_id}-${index}`} src={pt.logo} className="" alt="" />
            )
          })
        }
      </div>
    </div>
  )
}