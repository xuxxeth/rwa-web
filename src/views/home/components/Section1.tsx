import { useId } from "react"
import { cn } from "@/utils"

export function Section1() {
  const starList = [
    {path: './images/icons/star/1.png'},
    {path: './images/icons/star/2.png'},
    {path: './images/icons/star/3.png'},
    {path: './images/icons/star/4.png'},
    {path: './images/icons/star/5.png'},
    {path: './images/icons/star/6.png'},
    {path: './images/icons/star/7.png'},
    // {path: './images/icons/star/8.png'},
  ]
  const _id = useId()
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
        <div className=" relative z-50">
          <div className="text-[45px] font-medium text-center mt-[218px]">Empowering the Convergence of </div>
          <div className="flex justify-center mt-2">
            <div className="text-[70px] leading-[70px] font-medium text-center w-[900px] ">Traditional Finance and On-Chain Innovation</div>
          </div>
          <div className="flex justify-center mt-8">
            <div className="text-[18px] leading-[26px] text-center w-[680px] ">Our platform unites traditional finance with blockchain innovation, enabling tokenized assets and on-chain trading to transform capital markets—making them more efficient, transparent, and accessible.</div>
          </div>
          <div className="flex justify-center mt-[64px]">
            <div className="bg-[#FFFFFF] rounded-[100px] h-[64px] flex items-center justify-center px-[90px] text-[#1A1B23] font-semibold text-[18px]">Start Trading</div>
          </div>
        </div>
      </div>
    </>
    
  )
}