import { Menus } from "@/components/menu";
import { MainLayout } from "@/layouts/main";
import { BoxCard } from "@/components/BoxCard";
import { LazyImage } from "@/components/image/LazyImage";
import { useTranslation } from "@/hooks/useTranslation";
import { XFooter } from "@/components/footer";
import { useEffect, useState } from "react";
import { MarketTrading } from "@/components/market-trading";
import { ConvertTabs } from "@/components/markets/ConvertTabs";
import { KlineSwitch } from "@/components/markets/KlineSwitch";
import { ConverBody } from "@/components/markets/ConvetBody";
import { FAQ } from "@/components/markets/FAQ";
import { KlineBody } from "../components/Klinebody";
import { useTradeStore } from "@/stores/tradeStore";

function Markets() {
  const { t } = useTranslation()
  const [action, setAction] = useState('buy')
  const inputToken = useTradeStore(state => state.inputToken)
  return (
    <>
      {/* <Menus /> */}
      <MainLayout>
        <div className=" bg-[rgba(7,8,13,1)] min-h-[100vh] pt-[88px] text-white ">
          <div className="flex items-center text-[12px] font-normal my-3">
            <div>{t('Markets')}</div>
            <LazyImage src="/images/convert/arrow-right.png" className="w-[12px] h-[12px] mx-1" />
            <div>{inputToken?.symbol || '--'}</div>
          </div>
          <MarketTrading align="left" />
          <div className="pt-5 flex gap-x-5">
            <div className="flex-1">
              <KlineBody />
            </div>
            <div className="w-[350px] shrink-0">
              <BoxCard className="min-h-[448px] rounded-[4px]">
                <ConvertTabs from="markets" onChange={(tab) => setAction(tab.key)} />
                <div className="flex items-center justify-between mt-5">
                  <div className="text-[16px] font-medium flex-1 border-b border-[rgba(255,255,255,0.1)] leading-6">{t('limit')}</div>
                  <div className="flex items-center gap-x-5">
                    <button className=" hover:bg-[rgba(255,255,255,0.1)] w-7 h-7 rounded-[8px] overflow-hidden cursor-pointer"
                      onClick={() => {
                        
                      }}
                    >
                      <LazyImage src="/images/convert/history.png" className="w-7 h-7 cursor-pointer" />
                    </button>
                  </div>
                </div>
                <ConverBody from="markets" action={action} />
              </BoxCard>
              <FAQ />

            </div>
            
          </div>
        </div>

      </MainLayout>
      {/* <XFooter /> */}
    </>
    
  )
}

export default Markets