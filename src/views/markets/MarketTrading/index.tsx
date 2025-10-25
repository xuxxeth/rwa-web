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
import { useWssOn } from "@/hooks/useWssOn";
import { useBaseStore } from "@/stores/baseStore";
import { useWssStore } from "@/stores/wssStore";
import { useRequestSignature } from "@/hooks/useSignature";
import { DialogController, useShowDialog } from "@/components/dialog/DialogController";
import { OrderList } from "@/components/markets/OrderList";
import { useRouter } from "@/hooks/useRouter";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";

function Markets() {
  const router = useRouter()
  const { t } = useTranslation()
  const { account } = useActiveWeb3()
  const [action, setAction] = useState('buy')
  const setShowConnect = useBaseStore(state => state.setShowConnect)
  const inputToken = useTradeStore(state => state.inputToken)
  const orderDialog = useShowDialog()
  const { signing, signature, validSignature } = useRequestSignature()

  const setTokenWithPriceByWebSocketData = useBaseStore(
    state => state.setTokenWithPriceByWebSocketData
  )
  const setStockWithPriceByWebSocketData = useBaseStore(
    (state) => state.setStockWithPriceByWebSocketData
  );
  const stableTokenWithPrice = useWssStore(state => state.setStableTokenWithPrice)

  useWssOn('summary', (data: any) => {
    setTokenWithPriceByWebSocketData(data || [])
    setStockWithPriceByWebSocketData(data || [])
    stableTokenWithPrice(data || [])
  })

  return (
    <>
      {/* <Menus /> */}
      <MainLayout>
        <div className=" bg-[rgba(7,8,13,1)] min-h-[100vh] text-white ">
          <div className="flex items-center text-[12px] font-normal my-3">
            <div 
              className=" cursor-pointer"
              onClick={() => {
                router.push('/markets/quotes')
              }}
            >{t('Markets')}</div>
            <LazyImage src="/images/convert/arrow-right.png" className="w-[12px] h-[12px] mx-1" />
            <div>{inputToken?.symbol || '--'}</div>
          </div>
          <MarketTrading align="left" />
          <div className="pt-5 flex gap-x-5">
            <div className="flex-1">
              <KlineBody from="market" />
            </div>
            <div className="w-[350px] shrink-0">
              <BoxCard className="min-h-[448px] rounded-[4px] p-4">
                <ConvertTabs from="markets" onChange={(tab) => setAction(tab.key)} />
                <div className="flex items-center justify-between mt-5">
                  <div className="text-[16px] font-medium flex-1 border-b border-[rgba(255,255,255,0.1)] leading-6">{t('limit')}</div>
                  <div className="flex items-center gap-x-5">
                    <button disabled={signing} className=" hover:bg-[rgba(255,255,255,0.1)] w-7 h-7 rounded-[8px] overflow-hidden cursor-pointer"
                      onClick={async (e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (!account) {
                          setShowConnect(true)
                          return
                        }
                        if (signing) return
                        if (!(await validSignature())) {
                          const res = await signature()
                          if (res?.signature) {
                            orderDialog.setOpen(true)
                          }
                        } else {
                          orderDialog.setOpen(true)
                        }
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
      <DialogController
        topFixed
        top={30}
        title={t("assets.tabList.orderHistory")}
        open={orderDialog.open}
        openChange={orderDialog.setOpen}
      > 
        <OrderList show={orderDialog.open} />
      </DialogController>
      {/* <XFooter /> */}
    </>
    
  )
}

export default Markets