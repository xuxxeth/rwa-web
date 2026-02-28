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
  from?: string
}


const ConvertTabItem = memo(
  ({ tab, selected, onClick }: ConvertTabItemProps) => {
    return (
      <div 
        onClick={() => {
          onClick && onClick(tab)
        } }
        className={cn(
        "flex-1 flex items-center justify-center h-[44px] rounded-[8px] cursor-pointer font-medium text-[16px]",
        
        {
          'bg-[#2EBD85] text-black': selected === tab.key,
          'bg-[#F6465D] text-black': selected === tab.key
        }
      )}>
        { tab.label }
      </div>
    )
  }
)

const ConvertTabs = memo(
  ({ from }: ConvertTabsProps) => {
    const { t } = useTranslation()
    const activeConvertTab = useTradeStore(state => state.activeConvertTab)
    const updateActiveConvertTab = useTradeStore(state => state.updateActiveConvertTab)
    
    const tabs: TabItemProps[] = [{key: 'buy', label: t('Buy')}, {key: 'sell', label: t('Sell')}]
    // const [selected, setSelected] = useState('buy')
    return (
      <div className={cn(
        " flex items-center w-full p-1 bg-[#1A1B1E] text-[#9DA3AF]",
        from === "markets" ? "h-[36px] rounded-[4px]" : "h-[48px] rounded-[16px]"
      )}>
        <div 
          onClick={() => {
            updateActiveConvertTab('buy')
          } }
          className={cn(
          "flex-1 flex items-center justify-center rounded-[4px] cursor-pointer font-medium text-[12px]",
          {
            'bg-[rgba(37,167,80,0.2)] text-[#2EE4A7]': activeConvertTab === 'buy',
            'h-[44px] rounded-[8px]': from !== 'markets',
            'h-[28px] rounded-[4px]': from === 'markets',
          }
        )}>
          { t('Buy') }
        </div>
        <div 
          onClick={() => {
            updateActiveConvertTab('sell')
          } }
          className={cn(
          "flex-1 flex items-center justify-center rounded-[4px] cursor-pointer font-medium text-[12px]",
          {
            'bg-[rgba(202,63,100,0.2)] text-[#F63C6B]': activeConvertTab === 'sell',
            'h-[44px] rounded-[8px]': from !== 'markets',
            'h-[28px] rounded-[4px]': from === 'markets',
          }
        )}>
          { t('Sell') }
        </div>
      </div>
    )
  }
)

export { ConvertTabs }