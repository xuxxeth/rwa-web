import { useTranslation } from '@/hooks/useTranslation'
import { useState } from 'react'
import { cn } from '@/utils'
import OpenOrder from './OpenOrder'
import HistoryOrder from './HistoryOrder'
import TradeHistory from './TradeHistory'

function Order(props: {
  chainId?: number | null
  account?: string
  tabClassName?: string
  showFilter?: boolean
  dataMode: 'pagination' | 'scroll'
}) {
  const { t } = useTranslation()

  const [activeTab, setActiveTab] = useState<'openOrder' | 'historyOrder' | 'tradeHistory'>(
    'openOrder'
  )
  return (
    <>
      <div className={cn('gap-1 mb-3 flex-0 ', props.tabClassName)}>
        <div className='inline-flex flex-row mx-4 p-1 rounded-md items-center border border-gray-850'>
          {[
            {
              key: 'openOrder' as 'openOrder',
            },
            {
              key: 'historyOrder' as 'historyOrder',
            },
            {
              key: 'tradeHistory' as 'tradeHistory',
            },
          ].map(({ key }) => {
            return (
              <div
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  'text-sm/4.5 rounded-sm cursor-pointer px-2 py-[2px] font-medium',
                  activeTab === key ? 'bg-gray-750' : ''
                )}
              >
                {t(`portfolio.${key}`)}
              </div>
            )
          })}
        </div>
      </div>
      {activeTab === 'openOrder' && <OpenOrder {...props} />}
      {activeTab === 'historyOrder' && <HistoryOrder {...props} />}
      {activeTab === 'tradeHistory' && <TradeHistory {...props} />}
    </>
  )
}

export default Order
