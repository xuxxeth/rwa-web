import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo, useState } from "react"
import { useTradeStore } from "@/stores/tradeStore"

type TabItemProps = {
  key: string,
  label: string
}
type ConvertTabItemProps = {
  tab: TabItemProps,
  selected?: string,
  onClick?: (tab: TabItemProps) => void
}

type ConvertTabsProps = {
  onChange?: (tab: TabItemProps) => void
  className?: string
}


const ConvertAction = memo(
  ({ onChange, className }: ConvertTabsProps) => {
    const { t } = useTranslation()
    const activeConvertTab = useTradeStore(state => state.activeConvertTab)
    const updateActiveConvertTab = useTradeStore(state => state.updateActiveConvertTab)
    
    const tabs: TabItemProps[] = [{key: 'buy', label: t('Buy')}, {key: 'sell', label: t('Sell')}]

    return (
      <div className={cn(
        " absolute border-[4px] border-[#131416] bg-[#1A1B1E] rounded-[8px] w-[34px] h-[34px] flex items-center justify-center cursor-pointer top-[-13px] left-1/2 transform -translate-x-1/2",
        className
      )}
        onClick={() => {
          const newTab = activeConvertTab === 'buy' ? 'sell' : 'buy'
          updateActiveConvertTab(newTab)
          onChange && onChange(tabs.find(tab => tab.key === newTab)!)
        }}
      >
        <img src="/images/v2/icons/trade-swap.png" className="w-[18px] h-[18px] opacity-80 hover:opacity-100"/>
      </div>
    )
  }
)

export { ConvertAction }