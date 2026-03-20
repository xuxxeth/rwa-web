import { StockInfo } from "@/components/markets/Klinebody"
import { TradingChart } from "@/components/TVChart/TradingChart"
import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/utils/tw"
import { lazy, memo, useState, Suspense } from "react"

const OrderInTrade = lazy(() => import("./Order"));
const LazyStatistics = lazy(() => import("@/components/markets/Statistics").then(m => ({ default: m.Statistics })))
const LazyProfile = lazy(() => import("@/components/markets/Profile").then(m => ({ default: m.Profile })))
const LazyFinancials = lazy(() => import("@/components/markets/Financials").then(m => ({ default: m.Financials })))

const KlineBody = memo(
  ({ from }: { from?: string }) => {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<string>('kline')
    return (
      <div className="w-full h-full">
        <StockInfo from="pro-trading" />
        <div className="h-1 bg-[#1A1B1E]"></div>
        <div className="py-2">
          <div
            className={cn(
              'gap-1 flex-0 mx-4 p-1 rounded-[8px] inline-flex flex-row items-center border border-[#232427]',
            )}
          >
            {[
              {
                key: 'kline',
              },
              {
                key: 'com' ,
              },
            ].map(({ key }) => {
              return (
                <div
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'text-sm/4.5 rounded-[6px] cursor-pointer px-2 py-[2px] font-medium text-[#9DA3AF]',
                    activeTab === key ? 'bg-[#383A40] text-white' : ''
                  )}
                >
                  {t(`v2.tx.${key}`)}
                </div>
              )
            })}
          </div>
        </div>
        <div hidden={activeTab !== 'kline'} className="w-full relative" style={{ height: 'calc(100% - 115px)'}}>
          <TradingChart from={from} mode="tv" />
          <div className="h-1 bg-[#1A1B1E]"></div>
          <div className="absolute w-full" style={{ height: 'calc(100% - 504px)',minHeight: 400 }}>
            <OrderInTrade />
          </div>
        </div>

        <div hidden={activeTab !== 'com'} className="px-4 mb-2">
          <LazyStatistics from={from} />
          <LazyProfile from={from} />
          <LazyFinancials />
        </div>
        
        
      </div>
    )
  }
)


export { KlineBody }