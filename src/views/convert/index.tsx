import { Menus } from "@/components/menu";
import { MainLayout } from "@/layouts/main";
import { BoxCard } from "./components/BoxCard";
import { LazyImage } from "@/components/image/LazyImage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";
import { ConverBody } from "./components/ConvetBody";

function Convert() {
  const { t } = useTranslation()

  const tabsTriggerCss = ` text-[24px] cursor-pointer`

  return (
    <>
      <Menus />
      <MainLayout>
        <div className=" bg-[rgba(7,8,13,1)] min-h-[100vh] pt-[88px] text-white ">
          <div className="pt-5 flex gap-x-5">
            <div className="w-[691px] shrink-0">
              <BoxCard className="flex items-center rounded-2xl gap-x-2">
                <div className="">
                  <LazyImage src="/images/convert/pre.png" className="w-8" />
                </div>
                <div className=" font-semibold text-[16px]">Currently in U.S. stock &#123;After-Hours&#125; session. Only limit orders for whole tokens are supported.</div>
              </BoxCard>
              <BoxCard className="min-h-[448px] rounded-[32px] mt-5">
                <div className="flex items-center justify-between">
                  <Tabs defaultValue="account" className="">
                    <TabsList className=" bg-[rgba(0,0,0,0)]">
                      <TabsTrigger
                        value="account"
                        className={tabsTriggerCss}
                      >
                        {t('Market')}
                      </TabsTrigger>
                      <TabsTrigger
                        value="password"
                        className={tabsTriggerCss}
                      >
                        {t('Limit')}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <button className=" hover:bg-[rgba(255,255,255,0.1)] w-9 h-9 rounded-[8px] overflow-hidden cursor-pointer">
                    <LazyImage src="/images/convert/kline.png" className="w-9 h-9 cursor-pointer" />
                  </button>
                </div>
                <ConverBody />
              </BoxCard>
            </div>
            <div className="flex-1">
              <BoxCard className="min-h-[982px] rounded-[32px] p-8">

              </BoxCard>
            </div>
          </div>
        </div>

      </MainLayout>
    </>
    
  )
}

export default Convert