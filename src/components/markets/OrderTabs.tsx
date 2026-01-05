import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo, useState } from "react"

type TabItemProps = {
  key: string,
  label: string
}
type OrderTabItemProps = {
  tab: TabItemProps,
  selected?: string,
  onClick?: (tab: TabItemProps) => void
}

type OrderTabsProps = {
  onChange?: (tab: TabItemProps) => void
  from?: string
  disabled?: boolean
}


const OrderTabItem = memo(
  ({ tab, selected, onClick }: OrderTabItemProps) => {
    return (
      <div 
        onClick={() => {
          onClick && onClick(tab)
        } }
        className={cn(
        "flex items-center rounded-[8px] cursor-pointer font-medium text-[16px] text-[rgba(255,255,255,0.6)] relative h-[24px]",
        selected === tab.key ? 'text-[#FFFFFF]' : ''
      )}>
        { tab.label }
        {
          selected === tab.key && <div className=" absolute -bottom-[4px] left-0 w-full h-[2px] bg-white"></div>
        }
        
      </div>
    )
  }
)

const OrderTabs = memo(
  ({ onChange, disabled }: OrderTabsProps) => {
    const { t } = useTranslation()
    
    const tabs: TabItemProps[] = [{key: 'open', label: t('assets.order.openOrders')}, {key: 'history', label: t('assets.order.orderHistory')}]
    const [selected, setSelected] = useState('open')
    
    return (
      <div className="py-[8px] h-[44px] flex items-center px-6">
        <div className=" flex items-center w-full gap-x-6 border-b border-[rgba(255,255,255,0.1)] pb-1">
          {
            tabs.map(tab => (<OrderTabItem key={tab.key} tab={tab} selected={selected} onClick={tab => {
              if (disabled) return
              setSelected(tab.key)
              onChange && onChange(tab)
            }} />))
          }
        </div>
      </div>
      
    )
  }
)

export { OrderTabs }