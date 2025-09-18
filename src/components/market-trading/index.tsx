import { memo, useMemo } from "react";
import { BoxCard } from "../BoxCard";
import { LazyImage } from "../image/LazyImage";
import { useTranslation } from "@/hooks/useTranslation";

type stateProps = 'pre' | 'after' | 'close' | 'lock'

type MarketTradingProps = {
  state?: stateProps
}

const MarketTrading = memo(
  ({ state = 'pre' }: MarketTradingProps) => {
    const { t } = useTranslation()
    
    const marketInfo = useMemo(() => {
      let _icon = ''
      let _info = ''
      if (state === 'pre') {
        _icon = '/images/icons/market/market_pre.png'
        _info = t('MarketPreInfo')
      }
      if (state === 'after') {
        _icon = '/images/icons/market/market_after.png'
        _info = t('MarketAfterInfo')
      }
      if (state === 'close') {
        _icon = '/images/icons/market/market_close.png'
        _info = t('MarketCloseInfo')
      }
      if (state === 'lock') {
        _icon = '/images/icons/market/market_lock.png'
        _info = t('MarketLockInfo')
      }
      return {
        icon: _icon,
        info: _info
      }
    }, [state])

    return (
      <BoxCard className="rounded-2xl">
        <div className="flex items-center gap-x-2">
          <div className=" shrink-0">
            <LazyImage src={marketInfo.icon} className="w-8" />
          </div>
          <div className=" font-semibold text-[16px]">{marketInfo.info}</div>
        </div>
        {
          state === 'lock' && 
            <div className="flex justify-center mt-2">
              <div className="flex items-center gap-x-2">
                <span className="text-[#00DF80] font-normal text-[14px]">{t('Market open in')}</span>
                <div className="bg-[rgba(0,223,128,0.04)] w-[126px] h-[44px] flex items-center justify-center font-medium text-[24px] text-[#00DF80] rounded-[8px]">
                  15:27:06
                </div>
              </div>
            </div>
        }
        
      </BoxCard>
    )
  }
)

export { MarketTrading }