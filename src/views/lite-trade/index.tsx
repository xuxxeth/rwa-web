import { Menus } from "@/components/menu";
import { MainLayout } from "@/layouts/main";
import { BoxCard } from "../../components/BoxCard";
import { LazyImage } from "@/components/image/LazyImage";
import { useTranslation } from "@/hooks/useTranslation";
import { ConverBody } from "../../components/markets/ConvetBody";
import { InvestBody } from "../../components/markets/InvestBody";
import { XFooter } from "@/components/footer";
import { useEffect, useState } from "react";
import { MarketTrading } from "@/components/market-trading";
import { ConvertTabs } from "../../components/markets/ConvertTabs";
import { FAQ } from "../../components/markets/FAQ";
import { KlineSwitch } from "../../components/markets/KlineSwitch";
import { KlineBody } from "../../components/markets/Klinebody";
import { useRequestSignature } from "@/hooks/useSignature";
import { useBaseStore } from "@/stores/baseStore";

function LiteTrade() {
  const { t } = useTranslation()
  // const baseStore = useBaseStore()
  const [action, setAction] = useState('buy')
  const [showKline, setShowKline] = useState(false)

  const { signature, validSignature } = useRequestSignature()
  const marketTradeState = useBaseStore(state => state.marketTradeState)
  useEffect(() => {
    // baseStore.getTokens()
    // baseStore.getBaseRwas()
    // baseStore.getStocks()
  }, [])

  return (
    <>
      <Menus />
      <MainLayout>
        <div className=" bg-[rgba(7,8,13,1)] min-h-[100vh] pt-[88px] text-white ">
          <MarketTrading state={marketTradeState} />
          <div className="pt-5 flex gap-x-5">
            <div className="w-[691px] shrink-0">
              <BoxCard className="min-h-[448px] rounded-[32px]">
                <ConvertTabs onChange={(tab) => setAction(tab.key)} />
                <div className="flex items-center justify-between mt-5">
                  <div className="text-[24px] font-medium">{t('limit')}</div>
                  <div className="flex items-center gap-x-5">
                    <button className=" hover:bg-[rgba(255,255,255,0.1)] w-9 h-9 rounded-[8px] overflow-hidden cursor-pointer"
                      onClick={async () => {
                        if (!(await validSignature())) {
                          signature()
                        }
                      }}
                    >
                      <LazyImage src="/images/convert/history.png" className="w-9 h-9 cursor-pointer" />
                    </button>
                    <KlineSwitch onChange={show => setShowKline(show)} />
                  </div>
                </div>
                <ConverBody action={action} />
              </BoxCard>
              <FAQ />

            </div>
            <div className="flex-1">
              <BoxCard className="min-h-[600px] rounded-[32px] p-8">
                {
                  showKline ? <KlineBody /> : <InvestBody /> 
                }
                
              </BoxCard>
            </div>
          </div>
        </div>

      </MainLayout>
      <XFooter />
    </>
    
  )
}

export default LiteTrade