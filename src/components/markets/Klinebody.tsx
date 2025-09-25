import { SmallButton } from "@/components/button/SmallButton"
import { LazyImage } from "@/components/image/LazyImage"
import { TradingChart } from "@/components/TVChart/TradingChart"
import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo } from "react"
import { Statistics } from "./Statistics"
import { Profile } from "./Profile"

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



const KlineBody = memo(
  () => {
    const { t } = useTranslation()
    
    return (
      <div>
        <StockInfo />
        <div className="mt-4">
          <TradingChart />
        </div>
        <Statistics />
        <Profile />
      </div>
    )
  }
)

export { KlineBody }