import { MainLayout } from "@/layouts/main";
import { BoxCard } from "../../components/BoxCard";
import { useTranslation } from "@/hooks/useTranslation";
import { TradeBox } from "../../components/markets/TradeBox";
import { InvestBody } from "../../components/markets/InvestBody";
import { XFooter } from "@/components/footer";
import { lazy, useEffect, useState } from "react";
import { MarketTrading } from "@/components/market-trading";
import { ConvertTabs } from "../../components/markets/ConvertTabs";
import { KlineSwitch } from "../../components/markets/KlineSwitch";
import { KlineBody } from "../../components/markets/Klinebody";
import { useRequestSignature, useSignatureValidStatus } from "@/hooks/useSignature";
import { useWssOn } from "@/hooks/useWssOn";
import { useBaseStore } from "@/stores/baseStore";
import { useWssStore } from "@/stores/wssStore";
import { DialogController, useShowDialog } from "@/components/dialog/DialogController";
import { OrderList } from "@/components/markets/OrderList";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import IconOrder from "@/components/icons/order";

const FAQ = lazy(() => import("../../components/markets/FAQ"));

function LiteTrade() {
  const { account } = useActiveWeb3()
  const { t } = useTranslation()
  const orderDialog = useShowDialog()
  const setShowConnect = useBaseStore(state => state.setShowConnect)
  // const setTokenWithPriceByWebSocketData = useBaseStore(
  //   state => state.setTokenWithPriceByWebSocketData
  // )
  // const setStockWithPriceByWebSocketData = useBaseStore(
  //   (state) => state.setStockWithPriceByWebSocketData
  // );
  // const stableTokenWithPrice = useWssStore(state => state.setStableTokenWithPrice)
  const [ isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()
  const [action, setAction] = useState('buy')
  const [showKline, setShowKline] = useState(false)

  const { signing, signature, validSignature } = useRequestSignature()

  // useWssOn('summary', (data: any) => {
  //   setTokenWithPriceByWebSocketData(data || [])
  //   setStockWithPriceByWebSocketData(data || [])
  //   stableTokenWithPrice(data || [])
  // })

  return (
    <>
      
        <div className="  min-h-[100vh] text-white">
          {/* <MarketTrading/> */}
          <MainLayout>
          <div className="pt-5 flex gap-x-10">
            <div className="w-[580px]">
              <BoxCard className="min-h-[600px] rounded-[32px] p-6 bg-[rgba(255,255,255,0.0)]">
                {
                  showKline ? <KlineBody /> : <InvestBody /> 
                }
                
              </BoxCard>
            </div>
            <div className="flex-1 shrink-0">
              <BoxCard className="min-h-[448px] rounded-[32px] bg-[rgba(255,255,255,0.0)]">
                <ConvertTabs onChange={(tab) => setAction(tab.key)} />
                <div className="flex items-center justify-between mt-2">
                  <div className="text-[20px] font-medium">{t('limit')}</div>
                  <div className="flex items-center gap-x-4">
                    <button disabled={signing} className=" hover:bg-[rgba(255,255,255,0.1)] rounded-[8px] overflow-hidden cursor-pointer flex justify-center"
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
                            refreshIsSignatureValid(true)
                            orderDialog.setOpen(true)
                          }
                        } else {
                          orderDialog.setOpen(true)
                        }
                      }}
                    >
                      <IconOrder />
                    </button>
                    <KlineSwitch onChange={show => setShowKline(show)} />
                  </div>
                </div>
                <TradeBox action={action} />
              </BoxCard>
              <FAQ />

            </div>
            
          </div>
          </MainLayout>

        </div>

      <XFooter />
      
      <DialogController
        className="p-0"
        headerClassName="px-4 pt-5"
        topFixed
        title={'订单确认'}
        open={orderDialog.open}
        openChange={orderDialog.setOpen}
      > 
        <OrderList show={orderDialog.open} onClose={() => {
          orderDialog.setOpen(false)
          signature()
        }} />
      </DialogController>
    </>
    
  )
}

export default LiteTrade
