import { Menus } from "@/components/menu";
import { MainLayout } from "@/layouts/main";
import { BoxCard } from "../../components/BoxCard";
import { LazyImage } from "@/components/image/LazyImage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";
import { ConverBody } from "./components/ConvetBody";
import { InvestBody } from "./components/InvestBody";
import { XFooter } from "@/components/footer";
import { useToast } from "@/hooks/useToast";
import { useEffect } from "react";
import { MarketTrading } from "@/components/market-trading";
import { ConvertTabs } from "./components/ConvertTabs";
import { FAQ } from "./components/FAQ";

function Convert() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()

  const tabsTriggerCss = ` text-[24px] cursor-pointer`

  useEffect(() => {
    
  }, [])


  return (
    <>
      <Menus />
      <MainLayout>
        <div className=" bg-[rgba(7,8,13,1)] min-h-[100vh] pt-[88px] text-white ">
          <MarketTrading state="close" />
          <div className="pt-5 flex gap-x-5">
            <div className="w-[691px] shrink-0">
              <BoxCard className="min-h-[448px] rounded-[32px]">
                <ConvertTabs />
                <div className="flex items-center justify-between mt-5">
                  <div className="text-[24px] font-medium">Limit</div>
                  <div className="flex items-center gap-x-5">
                    <button className=" hover:bg-[rgba(255,255,255,0.1)] w-9 h-9 rounded-[8px] overflow-hidden cursor-pointer"
                      onClick={() => {
                        
                      }}
                    >
                      <LazyImage src="/images/convert/history.png" className="w-9 h-9 cursor-pointer" />
                    </button>
                    <button className=" hover:bg-[rgba(255,255,255,0.1)] w-9 h-9 rounded-[8px] overflow-hidden cursor-pointer"
                      onClick={() => {
                        toastSuccess({
                          title: 'The notification content',
                          btnText: 'Button',
                          onClick: () => {
                          }
                        })
                      }}
                    >
                      <LazyImage src="/images/convert/kline.png" className="w-9 h-9 cursor-pointer" />
                    </button>
                  </div>
                </div>
                <ConverBody />
              </BoxCard>
              <FAQ />

            </div>
            <div className="flex-1">
              <BoxCard className="min-h-[600px] rounded-[32px] p-8">
                <InvestBody />
              </BoxCard>
            </div>
          </div>
        </div>

      </MainLayout>
      <XFooter />
    </>
    
  )
}

export default Convert