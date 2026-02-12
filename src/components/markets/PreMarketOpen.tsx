import { useTradingStartTime } from "@/hooks/useMarketState"
import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/utils/tw"
import { memo } from "react"

const PreMarketOpen = memo(
  ({
    from
  }: {
    from?: string
  }) => {
    const { t, i18n } = useTranslation()
    const tradingTime = useTradingStartTime()

    return (
      <div className={cn(
        "h-[63px] px-3 flex items-center",
        tradingTime?.tradeState ? "h-[34px]" : ""
      )}>
        <div className={cn(
          "h-[44px] w-[2px] bg-[#FFB219] mr-2",
          tradingTime?.tradeState ? "h-[16px] bg-[#009DFF]" : ""
        )}>&nbsp;</div>
        {
          !tradingTime?.tradeState &&
            <div className="text-[12px] font-normal text-[#9DA3AF]">
              <div className=" leading-[14px]">{t('v2.tx.t44')}</div>
              <div className={cn(
                "flex items-center text-[12px]",
                i18n.language === "zh" ? "mt-[5px]" : ""
              )}>
                <div className=" text-white mr-2">{t('v2.tx.t43')}</div>
                <div className="text-[14px] text-[#FFB219] min-w-[100px]">
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
                  </div>
                  
                </div>
              </div>
              
            </div>
        }
        {
          tradingTime?.tradeState &&
            <div className="text-[12px] font-normal text-white flex items-center">
              <div className="mr-2">{t('v2.tx.t14')}</div>
              <div className="text-[14px] text-[#009DFF] min-w-[100px] flex items-center">
                {`${tradingTime?.openTime?.H}:${tradingTime?.openTime?.M}-${tradingTime?.closeTime?.H}:${tradingTime?.closeTime?.M}`}
                <div className="ml-[2px]">ET</div>
              </div>
              
            </div>
        }
        
      </div>
      
    )
  }
)

export { PreMarketOpen }