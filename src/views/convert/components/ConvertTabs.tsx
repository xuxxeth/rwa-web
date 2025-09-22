import { cn } from "@/lib/utils"
import { memo, useState } from "react"

type TabItemProps = {
  key: string,
  label: string
}
type ConvertTabItemProps = {
  tab: TabItemProps,
  selected?: boolean,
  onClick?: (tab: TabItemProps) => void
}

type ConvertTabsProps = {
  onChange?: (tab: TabItemProps) => void
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
        selected ? 'bg-[#21C95E] text-black' : ''
      )}>
        { tab.label }
      </div>
    )
  }
)

const ConvertTabs = memo(
  ({ onChange }: ConvertTabsProps) => {
    const tabs: TabItemProps[] = [{key: 'buy', label: 'Buy'}, {key: 'sell', label: 'Sell'}]
    const [selected, setSelected] = useState('buy')

    return (
      <div className=" flex items-center w-full h-[48px] bg-[#131823]">
        {
          tabs.map(tab => (<ConvertTabItem key={tab.key} tab={tab} selected={selected === tab.key} onClick={tab => {
            setSelected(tab.key)
            onChange && onChange(tab)
          }} />))
        }
      </div>
    )
  }
)

export { ConvertTabs }