import { GoButton } from "@/components/go-button";
import { RwaCard } from "@/components/rwa-card";
import { MARKET_STATUS } from "@/config/constants";
import { useRouter } from "@/hooks/useRouter";
import { useRwaPrice } from "@/hooks/useTokenBalances";
import { useTranslation } from "@/hooks/useTranslation";
import { MainLayout } from "@/layouts/main";
import type { IRwa, IStock } from "@/service/base/types";
import { useBaseStore } from "@/stores/baseStore";
import { useTradeStore } from "@/stores/tradeStore";
import { cn } from "@/utils";
import { useEffect, useId, useMemo, useState } from "react";

export const RwaPrice = (
  ({
    rwaData
  }: {rwaData: IRwa}) => {
    const rwaPrice = useRwaPrice(rwaData.symbol)
    const up = useMemo(() => Number(rwaPrice?.up), [rwaPrice?.up])
    if (!rwaPrice) return null
    return (
      <div className="flex items-center">
        <span className="text-[20px] text-white">${rwaPrice.price || '--'}</span>
        <span
          className={cn(
            "text-[14px] font-medium ml-4 w-[68px] h-[25px] flex items-center justify-center bg-[rgba(255,255,255,0.1)] rounded-[8px]",
            up === 0 ? 'text-[#A1A1A1]' : up > 0
              ? "text-[#50E3C2] "
              : "text-[rgba(227,80,122,1)] text-[14px]"
          )}
        >
          {up !== 0 && (up > 0 ? '+' : '-')}
          {Math.abs(Number(rwaPrice?.up || "0"))}%
        </span>
      </div>
    )
  }
)

export default function Section2() {
  const _id = useId()
  const { t } = useTranslation()
  const router = useRouter()
  const rwaList = useBaseStore(state => state.rwaList)
  const updateInputToken = useTradeStore(state => state.updateInputToken)

  return (
    <MainLayout>
      <div className="h-[640px] bg-[#06070A] relative text-white">
        <img src="/images/icons/star/8.png" className=" absolute top-0 right-[221px]" alt="" />
        <img src="/images/home/section2_bg.png" className="w-[600px] h-[600px] absolute left-[50%] -translate-x-[300px] top-[180px]" alt="" />
        <div className=" relative z-10">
          <div className=" font-medium text-[36px] pt-[72px] text-center">{t('home.text4')}</div>
          <div className=" flex justify-center">
            <div className="text-[18px] text-[rgba(255,255,255,0.8)] w-[790px] mt-6 text-center">{t('home.text5')}</div>
          </div>
          <div className="flex justify-center mt-[64px]">
            <div className=" grid grid-cols-3 gap-[40px]">
              {
                rwaList.slice(0, 6).map((item, index) => {
                  return (
                    <RwaCard key={`${_id}-${index}`}>
                      <div className="px-[32px] text-white flex flex-col justify-center h-full"
                        onClick={() => {
                          updateInputToken(item)
                          router.push('/lite-trade')
                        }}
                      >
                        <div className="flex items-center gap-x-[10px]">
                          <div className="w-[43px] h-[43px] rounded-full flex justify-center items-center">
                            <img src={item.icon} className=" w-full rounded-full" alt="" />
                          </div>
                          <div>
                            <div className="text-[18px] font-medium">{item.symbol}</div>
                            <div className="text-[16px] font-medium text-[rgba(255,255,255,0.6)]">{item.name}</div>
                          </div>
                        </div>
                        
                        <div className=" font-medium flex items-center justify-between mt-3">
                          <div className="flex items-center gap-x-2">
                            <RwaPrice rwaData={item} />
                          </div>
                          <GoButton 
                            
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