import { useTradingStartTime } from "@/hooks/useMarketState"
import { useTranslation } from "@/hooks/useTranslation"
import { memo } from "react"

const PreMarketOpen = memo(
  () => {
    const { t } = useTranslation()
    const tradingTime = useTradingStartTime()

    return (
      <div className="text-[12px] font-normal text-[#9DA3AF] shrink-0 ">
        <div className="flex items-center">
          {
            tradingTime?.tradeState ? 
              <div>{t('v2.tx.t14')}</div> :
              <div>{t('v2.tx.t15')}</div>
          }
          
        </div>
        <div className="text-[14px] text-[#FFB219] mt-[5px] min-w-[100px]">
          {
            !tradingTime?.tradeState ?
              <div className="flex items-center">
                <div className="flex items-center font-mono">
                  <div className="text-center">
                    {tradingTime?.countdown?.H}
                  </div>H
                </div>
                <div className="px-[4px]">:</div>
                <div className="flex items-center font-mono">
                  <div className="text-center">{tradingTime?.countdown?.M}</div>M
                </div>
                <div className="px-[4px]">:</div>
                <div className="flex items-center font-mono">
                  <div className="text-center">{tradingTime?.countdown?.S}</div>S
                </div>
              </div> :
             `${tradingTime?.openTime?.H}:${tradingTime?.openTime?.M}-${tradingTime?.closeTime?.H}:${tradingTime?.closeTime?.M}`
          }
          
        </div>
      </div>
    )
  }
)

export { PreMarketOpen }