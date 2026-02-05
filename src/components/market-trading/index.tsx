import { memo, useMemo, useState } from "react";
import { BoxCard } from "../BoxCard";
import { LazyImage } from "../image/LazyImage";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { useBaseStore } from "@/stores/baseStore";
import { MARKET_STATUS, RISK_STATUS } from "@/config/constants";
import { VerifyIdentity } from "./VerifyIdentity";
import { useKycStatus } from "@/hooks/useKycStatus";
import { usePendingStep } from "@/hooks/usePendingStep";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";

type MarketTradingProps = {
  align?: string
}

const MarketTrading = memo(
  ({  align = 'center' }: MarketTradingProps) => {
    const { t } = useTranslation()
    const { account } = useActiveWeb3()
    const marketTradeState = useBaseStore(state => state.marketTradeState)
    const { kycStatus } = useKycStatus()
    const pendingStep = usePendingStep()
    const [show, setShow] = useState(true)
    const marketInfo = useMemo(() => {
      let _icon = ''
      let _info = ''
      // if (state === 1) {
      //   _icon = '/images/icons/market/market_pre.png'
      //   _info = t('MarketPreInfo')
      // }
      // if (state === 3) {
      //   _icon = '/images/icons/market/market_after.png'
      //   _info = t('MarketAfterInfo')
      // }
      // if (state === 'close') {
      //   _icon = '/images/icons/market/market_close.png'
      //   _info = t('MarketCloseInfo')
      // }
      // if (state === 'lock') {
      //   _icon = '/images/icons/market/market_lock.png'
      //   _info = t('MarketLockInfo')
      // }
      if (marketTradeState === MARKET_STATUS.OPEN) {
        _icon = '/images/icons/market/market_open.png'
        _info = t('MarketOpenInfo')
      }
      if (marketTradeState === MARKET_STATUS.CLOSE) {
        _icon = '/images/icons/market/market_close.png'
        _info = t('MarketCloseInfo')
      }
      return {
        icon: _icon,
        info: _info
      }
    }, [marketTradeState, t])
    if (!marketInfo.info || !show) return <div className="bg-[#1A1B1E] h-1"></div>
    
    if (account && kycStatus !== RISK_STATUS.ISSUE && kycStatus !== RISK_STATUS.VERIFIED && kycStatus !== RISK_STATUS.NOTSIGN || pendingStep.step) return (
      <>
        <VerifyIdentity riskStatus={kycStatus} />
        <div className="bg-[#1A1B1E] h-1"></div>
      </>
    )
    return (
      <>
        <BoxCard className={cn(
          " h-[40px] py-0 flex items-center pl-4 relative",
          align === 'left' ? 'justify-start h-[40px]' : 'justify-center'
        )}>
          <div className="flex items-center gap-x-2">
            <div className=" shrink-0">
              {
                marketInfo.icon && <LazyImage src={marketInfo.icon} className="w-4" />
              }
              
            </div>
            <div className=" font-normal text-[14px]">{marketInfo.info}</div>
          </div>
          {
            // state === 'lock' && 
            //   <div className="flex justify-center mt-2">
            //     <div className="flex items-center gap-x-2">
            //       <span className="text-[#00DF80] font-normal text-[14px]">{t('Market open in')}</span>
            //       <div className="bg-[rgba(0,223,128,0.04)] w-[126px] h-[44px] flex items-center justify-center font-medium text-[24px] text-[#00DF80] rounded-[8px]">
            //         15:27:06
            //       </div>
            //     </div>
            //   </div>
          }
          <div className=" absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setShow(false)}
          >
            <LazyImage src="/images/v2/icons/close.png" className="w-[14px] h-[14px]" />
          </div>
        </BoxCard>
        <div className="bg-[#1A1B1E] h-1"></div>
      </>
    )
  }
)

export { MarketTrading }