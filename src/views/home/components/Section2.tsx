import { GoButton } from "@/components/go-button";
import { RwaCard } from "@/components/rwa-card";
import { MARKET_STATUS } from "@/config/constants";
import { useRouter } from "@/hooks/useRouter";
import { useRwaPrice } from "@/hooks/useTokenBalances";
import { MainLayout } from "@/layouts/main";
import type { IRwa, IStock } from "@/service/base/types";
import { useBaseStore } from "@/stores/baseStore";
import { useTradeStore } from "@/stores/tradeStore";
import { cn } from "@/utils";
import { useEffect, useId, useMemo, useState } from "react";

const showStocks = ['AAPL', 'TSLA', 'COIN', 'NVDA']

export const RwaPrice = (
  ({
    rwaData
  }: {rwaData: IRwa}) => {

    const marketTradeState = useBaseStore(state => state.marketTradeState)
    const rwaPrice = useRwaPrice(rwaData.symbol)

    if (!rwaPrice) return null
    return (
      <>
        {
          marketTradeState === MARKET_STATUS.OPEN ?
          <>
            <img src={Number(rwaPrice.up) > 0 ? './images/home/rate_up.png' : './images/home/rate_down.png'} className="w-[16px]" alt="" />
            <span className={cn(
              "",
              Number(rwaPrice.up) > 0 ? "text-[#34C759]" : "text-[#FF383C]"
            )}>{rwaPrice.up || '--'}%</span>
          </> : 
          <span className={cn(
              "",
            Number(rwaPrice.up || '--') > 0 ? "text-[#34C759]" : "text-[#FF383C]"
          )}>{rwaPrice.price} $</span>
        }
      </>
    )
  }
)



export default function Section2() {
  const _id = useId()

  const router = useRouter()
  const rwaList = useBaseStore(state => state.rwaList)
  const [filterStocks, setFilterStocks] = useState<IRwa[]>([])
  const updateInputToken = useTradeStore(state => state.updateInputToken)

  useEffect(() => {
    let rwas: IRwa[] = []
    showStocks.forEach(code => {
      const rwa = rwaList.find(rwa => rwa.symbol.startsWith(code))
      if (rwa) {
        rwas.push({
          ...rwa,
        })
      }
    })
    setFilterStocks(rwas)
  }, [rwaList])

  return (
    <MainLayout>
      <div className="h-[1066px] bg-[#06070A] relative text-white">
        <img src="./images/icons/star/8.png" className=" absolute top-0 right-[221px]" alt="" />
        <img src="./images/home/section2_bg.png" className="w-[600px] h-[600px] absolute left-[50%] -translate-x-[300px] top-[180px]" alt="" />
        <div className=" relative z-10">
          <div className=" font-semibold text-[44px] pt-[72px] text-center">Institutional grade investment experience</div>
          <div className=" flex justify-center">
            <div className="text-[18px] text-[rgba(255,255,255,0.8)] w-[790px] mt-6 text-center">Rapid execution and tight spreads, delivering a cost-efficient trading environment designed to meet the demands of sophisticated investors</div>
          </div>
          <div className="flex justify-center mt-[64px]">
            <div className=" grid grid-cols-2 gap-[88px]">
              {
                filterStocks.map((item, index) => {
                  return (
                    <RwaCard key={`${_id}-${index}`}>
                      <div className=" absolute -right-[26px] -top-[29px] 
                      w-[95px] h-[95px] rounded-full flex justify-center items-center backdrop-blur-[20px]">
                        <img src={item.icon} className=" w-full rounded-full" alt="" />
                      </div>
                      <div className="p-[56px] text-white">
                        <div className="text-[45px] font-semibold">{item.symbol}</div>
                        <div className="text-[25px] font-semibold text-[rgba(255,255,255,0.6)]">{item.name}</div>
                        <div className="text-[32px] font-medium flex items-center justify-between mt-14">
                          <div className="flex items-center gap-x-2">
                            <span>24 hours</span> 
                            
                            <RwaPrice rwaData={item} />
                          </div>
                          <GoButton 
                            onClick={() => {
                              updateInputToken(item)
                              router.push('/lite-trade')
                            }}
                          />
                        </div>
                      </div>
                    </RwaCard>
                  )
                })
              }
              
            </div>
          </div>
          
        </div>
        
      </div>
    </MainLayout>
   
  )
}