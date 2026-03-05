import { useTranslation } from '@/hooks/useTranslation'
import { useEffect, useState } from 'react'
import { cn } from '@/utils'
import OpenOrder from './OpenOrder'
import HistoryOrder from './HistoryOrder'
import TradeHistory from './TradeHistory'
import { useOrderFilterStore } from '@/stores/orderFilterStore'
import { useSearchParams } from 'react-router-dom'

function Order(props: {
  chainId?: number | null
  account?: string
  tabClassName?: string
  showFilter?: boolean
  dataMode: 'pagination' | 'scroll'
  allowUserFilter: boolean
}) {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState<'open' | 'history' | 'trade'>(() => {
    const type = searchParams.get('type')
    if (type === 'history' || type === 'trade') {
      return type
    }
    return 'open'
  })

  const clearAllFilters = useOrderFilterStore(state => state.clearAllFilters)

  useEffect(() => {
    return () => {
      clearAllFilters()
    }
  }, [])

  return (
    <>
      <div className={cn('gap-1 mb-3 flex-0 ', props.tabClassName)}>
        <div className='inline-flex flex-row mx-4 p-1 rounded-md items-center border border-gray-850'>
          {[
            {
              key: 'open' as 'open',
            },
            {
              key: 'history' as 'history',
            },
            {
              key: 'trade' as 'trade',
            },
          ].map(({ key }) => {
            return (
              <div
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  'text-sm/4.5 rounded-sm cursor-pointer px-2 py-[2px] font-medium text-gray-400',
                  activeTab === key ? 'bg-gray-750 text-white' : ''
                )}
              >
                {t(`portfolio.${key}`)}
              </div>
            )
          })}
        </div>
      </div>
      {activeTab === 'open' && <OpenOrder {...props} />}
      {activeTab === 'history' && <HistoryOrder {...props} />}
      {activeTab === 'trade' && <TradeHistory {...props} />}
    </>
  )
}

export default Order
