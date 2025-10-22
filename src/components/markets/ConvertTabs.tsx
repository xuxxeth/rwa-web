import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo, useState } from "react"

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
  ({ onChange, from }: ConvertTabsProps) => {
    const { t } = useTranslation()
    
    const tabs: TabItemProps[] = [{key: 'buy', label: t('Buy')}, {key: 'sell', label: t('Sell')}]
    const [selected, setSelected] = useState('buy')
    return (
      <div className={cn(
        " flex items-center w-full  bg-[#131823] ",
        from === "markets" ? "h-[40px] rounded-[4px]" : "h-[48px] rounded-[16px]"
      )}>
        <div 
          onClick={() => {
            setSelected('buy')
            onChange && onChange(tabs[0])
          } }
          className={cn(
          "flex-1 flex items-center justify-center cursor-pointer font-medium text-[16px]",
          {
            'bg-[#2EBD85] text-black': selected === 'buy',
            'h-[44px] rounded-[8px]': from !== 'markets',
            'h-[36px] rounded-[4px]': from === 'markets',
          }
        )}>
          { t('Buy') }
        </div>
        <div 
          onClick={() => {
            setSelected('sell')
            onChange && onChange(tabs[1])
          } }
          className={cn(
          "flex-1 flex items-center justify-center h-[44px] rounded-[8px] cursor-pointer font-medium text-[16px]",
          {
            'bg-[#F6465D] text-black': selected === 'sell',
            'h-[44px] rounded-[8px]': from !== 'markets',
            'h-[36px] rounded-[4px]': from === 'markets',
          }
        )}>
          { t('Sell') }
        </div>
      </div>
    )
    // return (
    //   <div className=" flex items-center w-full h-[48px] bg-[#131823] rounded-[16px]">
    //     {
    //       tabs.map(tab => (<ConvertTabItem key={tab.key} tab={tab} selected={tab.key} onClick={tab => {
    //         setSelected(tab.key)
    //         onChange && onChange(tab)
    //       }} />))
    //     }
    //   </div>
    // )
  }
)

export { ConvertTabs }