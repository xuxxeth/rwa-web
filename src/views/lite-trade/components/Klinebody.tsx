import { SmallButton } from "@/components/button/SmallButton"
import { LazyImage } from "@/components/image/LazyImage"
import { TradingChart } from "@/components/TVChart/TradingChart"
import { useTranslation } from "@/hooks/useTranslation"
import { memo } from "react"

const StockInfo = memo(
  () => {
    const { t } = useTranslation()
    return (
      <div className="flex justify-between text-white">
        <div className="flex items-center">
          <LazyImage src="/images/tokens/amznc.png" className="w-[54px] h-[54px]" />
          <div className="ml-2 mr-5">
            <div className="text-[20px] font-medium ">AMZNc</div>
            <div className=" text-[14px] font-normal text-[rgba(255,255,255,0.6)]">Amazon</div>
          </div>
          <div className="">
            <div className="text-[20px] font-medium ">$203.22 </div>
            <div className=" text-[14px] font-normal text-[#50E3C2] flex items-center">
              <LazyImage src="/images/convert/price_up.png" className="w-[6px] h-[6px] mr-1" />
              <span>2.98%</span>
            </div>
          </div>
        </div>
        <SmallButton >{t('Enter Pro Trading')}</SmallButton>
      </div>
    )
  }
)
const About = memo(
  () => {
    const { t } = useTranslation()
    return (
      <div className=" text-white mt-6">
        <div className="text-[18px] font-medium ">{t('About')}</div>
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

const KlineBody = memo(
  () => {
    const { t } = useTranslation()
    
    return (
      <div>
        <StockInfo />
        <div className="mt-4">
          <TradingChart />
        </div>
        <About />
      </div>
    )
  }
)

export { KlineBody }