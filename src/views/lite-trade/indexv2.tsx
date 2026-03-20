import { MainLayout } from "@/layouts/main";
import { BoxCard } from "../../components/BoxCard";
import { TradeBox } from "../../components/markets/TradeBox";
import { useRequestSignature, useSignatureValidStatus } from "@/hooks/useSignature";
import { useBaseStore } from "@/stores/baseStore";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import IconOrder from "@/components/icons/order";
import { LiteTradeInfo } from "@/components/markets/LiteTradeInfo";
import { PositionRwa } from "./components/PositionRwa";
import { openUrl } from "@/utils/scan";
import { PreMarketOpen } from "@/components/markets/PreMarketOpen";
import { TradeTypeSwitch } from "../markets/MarketTrading/TradeTypeSwitch";

function LiteTrade() {
  const { account } = useActiveWeb3()
  const setShowConnect = useBaseStore(state => state.setShowConnect)
  const [ _, refreshIsSignatureValid] = useSignatureValidStatus()
  const { signing, signature, validSignature } = useRequestSignature()

  return (
    <>
      <div className="bg-[#1A1B1E] min-h-[calc(100vh-60px)] text-white relative">
        <PositionRwa 
          src="/images/tokens/GOOGL.png"
          className=" top-[1px] right-[50%] w-[70px] h-[70px]"
        />
        <PositionRwa 
          src="/images/tokens/NFLX.png"
          className=" top-[200px] right-[28px] w-[92px] h-[92px] -rotate-45"
        />
        <PositionRwa 
          src="/images/tokens/AAPL.png"
          className=" bottom-[44px] right-[164px] w-[95px] h-[95px]"
        />
        <PositionRwa 
          src="/images/tokens/NVDA.png"
          className=" bottom-[70px] left-[40%] w-[64px] h-[64px] -rotate-12"
        />
        <PositionRwa 
          src="/images/tokens/AMZN.png"
          className=" top-[278px] left-[43px] w-[62px] h-[62px]"
        />
        <MainLayout>
        <div className="pt-[106px] flex gap-x-2 justify-center">
          <LiteTradeInfo />
          <div className="flex gap-x-[14px]">
            <div className="w-[420px]">
              <BoxCard className="rounded-[16px] bg-[#131416] relative">
                <div className="mb-3">
                  <TradeTypeSwitch />
                </div>
                <TradeBox from="lite-trade" />
              </BoxCard>
              <div className="border border-[#232427] rounded-[16px] px-3 py-2 mt-2">
                <PreMarketOpen from="lite-trade" />
              </div>

            </div>
            <button disabled={signing} className=" bg-[#131416] w-9 h-9 rounded-full overflow-hidden cursor-pointer flex items-center justify-center"
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
                    openUrl('/order')
                  }
                } else {
                  openUrl('/order')
                }
              }}
            >
              <IconOrder className="w-4 h-4" />
            </button>
          </div>
          
          
        </div>
        </MainLayout>
      </div>
    </>
    
  )
}

export default LiteTrade
