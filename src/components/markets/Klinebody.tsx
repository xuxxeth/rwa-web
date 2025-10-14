import { SmallButton } from "@/components/button/SmallButton"
import { LazyImage } from "@/components/image/LazyImage"
import { TradingChart } from "@/components/TVChart/TradingChart"
import { useTranslation } from "@/hooks/useTranslation"
import { memo } from "react"
import { Statistics } from "./Statistics"
import { Profile } from "./Profile"
import { useTradeStore } from "@/stores/tradeStore"
import { useRwaPrice } from "@/hooks/useTokenBalances"
import type { IRwa } from "@/service/base/types"
import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/useRouter"

const RwaItemPrice = memo(
  ({ data }: { data: IRwa}) => {
    const rwaPrice = useRwaPrice(data.symbol)
    if (!rwaPrice) return null

    return (
      <div className="">
        <div className="text-[20px] font-medium ">${rwaPrice.price || '--'}</div>
        <div className={cn(
          " text-[14px] font-normal text-[#50E3C2] flex items-center",
          Number(rwaPrice.up) > 0 ? 'text-[#50E3C2]' : 'text-[#E3507A]'
        )}>
          <LazyImage src={Number(rwaPrice.up) > 0 ? '/images/convert/price_up.png' : '/images/convert/price_down.png'} className="w-[6px] h-[6px] mr-1" />
          <span>{Math.abs(Number(rwaPrice.up))}%</span>
        </div>
      </div>
    )
  }
)

export const StockInfo = memo(
  ({ from }: { from?: string }) => {
    const { t } = useTranslation()
    const router = useRouter()
    const inputToken = useTradeStore(state => state.inputToken)
    return (
      <div className="flex justify-between text-white">
        <div className="flex items-center">
          <div className="w-[54px] h-[54px]">
            {
              inputToken?.icon && <LazyImage src={inputToken?.icon} className="w-[54px] h-[54px] rounded-full" />
            }
          </div>
          
          <div className="ml-2 mr-5">
            <div className="text-[20px] font-medium ">{inputToken?.symbol || '--'}</div>
            <div className=" text-[14px] font-normal text-[rgba(255,255,255,0.6)]">{inputToken?.name || '--'}</div>
          </div>
          {
            inputToken && <RwaItemPrice data={inputToken} />
          }
          
        </div>
        {
          from !== 'pro-trading' && 
            <SmallButton onClick={() => {
              router.push('/markets/trading')
            }} >{t('Enter Pro Trading')}</SmallButton>
        }
        
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