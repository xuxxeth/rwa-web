import { GoButton } from "@/components/go-button";
import { RwaCard } from "@/components/rwa-card";
import { MARKET_STATUS } from "@/config/constants";
import { MainLayout } from "@/layouts/main";
import type { IRwa, IStock } from "@/service/base/types";
import { useBaseStore } from "@/stores/baseStore";
import { cn } from "@/utils";
import { useEffect, useId, useMemo, useState } from "react";

const showStocks = ['AAPL', 'TSLA', 'COIN', 'NVDA']
export default function Section2() {
  const _id = useId()

  const marketTradeState = useBaseStore(state => state.marketTradeState)

  const rwaList = useBaseStore(state => state.rwaList)
  const [filterStocks, setFilterStocks] = useState<IRwa[]>([])
  useEffect(() => {
    let rwas: IRwa[] = []
    showStocks.forEach(code => {
      const rwa = rwaList.find(rwa => rwa.symbol.startsWith(code))
      if (rwa) {
        rwas.push({
          ...rwa,
          icon: `./images/home/${code.toLowerCase()}.png`
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
                      <div className=" absolute -right-[26px] -top-[29px] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.12)] 
                      w-[95px] h-[95px] rounded-full flex justify-center items-center backdrop-blur-[20px]">
                        <img src={item.icon} className=" scale-50" alt="" />
                      </div>
                      <div className="p-[56px] text-white">
                        <div className="text-[45px] font-semibold">{item.symbol}</div>
                        <div className="text-[25px] font-semibold text-[rgba(255,255,255,0.6)]">{item.name}</div>
                        <div className="text-[32px] font-medium flex items-center justify-between mt-14">
                          <div className="flex items-center gap-x-2">
                            <span>24 hours</span> 
                            {
                              marketTradeState === MARKET_STATUS.OPEN ?
                              <>
                                <img src={Number(item.up) > 0 ? './images/home/rate_up.png' : './images/home/rate_down.png'} className="w-[16px]" alt="" />
                                <span className={cn(
                                  "",
                                  Number(item.up) > 0 ? "text-[#34C759]" : "text-[#FF383C]"
                                )}>{item.up}%</span>
                              </> : 
                              <span className={cn(
                                  "",
                                Number(item.up) > 0 ? "text-[#34C759]" : "text-[#FF383C]"
                              )}>{item.price} $</span>
                            }
                            
                          </div>
                          <GoButton />
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