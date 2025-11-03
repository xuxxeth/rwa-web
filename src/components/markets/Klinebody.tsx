import { SmallButton } from "@/components/button/SmallButton"
import { TradingChart } from "@/components/TVChart/TradingChart"
import { useTranslation } from "@/hooks/useTranslation"
import { memo, useMemo } from "react"
import { Statistics } from "./Statistics"
import { Profile } from "./Profile"
import { useTradeStore } from "@/stores/tradeStore"
import { useRwaPrice } from "@/hooks/useTokenBalances"
import type { IRwa } from "@/service/base/types"
import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/useRouter"
import { StockSelect } from "./StockSelect"

const RwaItemPrice = memo(
  ({ data, from }: { data: IRwa, from?: string}) => {
    const rwaPrice = useRwaPrice(data.symbol)
    const up = useMemo(() => Number(rwaPrice?.up), [rwaPrice?.up])
    const isPro = from === 'pro-trading'

    if (!rwaPrice) return null

    return (
      <div className={cn(
        " text-right",
        isPro ? "flex items-center gap-x-5" : ""
      )}>
        <div className={cn(
          "text-[20px] font-medium leading-[100%]",
          isPro ? " text-[36px] " : ""
        )}>${rwaPrice.price || '--'}</div>
        <span
          className={cn(
            "leading-[100%]",
            up === 0 ? 'text-[#A1A1A1]' : up > 0
              ? "text-[#50E3C2] text-[12px]"
              : "text-[rgba(227,80,122,1)] text-[12px]",
            isPro ? " text-[20px] " : ""
          )
            
            
          }
        >
          {up !== 0 && (up > 0 ? '+' : '-')}
          {Math.abs(Number(rwaPrice?.up || "0"))}%
        </span>
      </div>
    )
  }
)

export const StockInfo = memo(
  ({ from }: { from?: string }) => {
    const { t } = useTranslation()
    const router = useRouter()
    const inputToken = useTradeStore(state => state.inputToken)
    return (
      <div className="flex justify-between text-white">
        <StockSelect from={from} />
        <div className={cn(
          " flex items-center gap-x-5",
        )}>
          {
            inputToken && <RwaItemPrice from={from} data={inputToken} />
          }
          {
            from !== 'pro-trading' && 
              <SmallButton onClick={() => {
                router.push('/markets/trading')
              }} >{t('Enter Pro Trading')}</SmallButton>
          }
        </div>
        
        
      </div>
    )
  }
)



const KlineBody = memo(
  () => {
    return (
      <div>
        <StockInfo />
        <div className="mt-4">
          <TradingChart />
        </div>
        <Statistics />
        <Profile />
      </div>
    )
  }
)

export { KlineBody }