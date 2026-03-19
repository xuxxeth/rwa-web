import {
  SideCell,
  TokenCell,
  ValueCell,
  AmountCell,
  TextCell,
  OrderTypeCell,
  DropDownFilter,
  TokenFilterItem,
  TxHashCell,
} from '../Shared'
import { type IRwa } from '@/service/base/types'
import { useRwaTokens } from '@/hooks/useTokens'
import { useMemo } from 'react'
import { scanApi } from '@/service/scan/api'
import { type ITableConfig } from '@/components/table-header'
import { type ITrade } from '@/service/scan/types'
import { textPrefix, toFixed, formatTimestamp, divide } from '@/utils'

import {
  useOrderFilterStore,
  generateTradeHistoryFilterObj,
  type ITradeHistoryFilter,
} from '@/stores/orderFilterStore'
import { DatePickerWithRange } from '@/components/date-range-picker'
import { OrderTable } from './shared'

const PAGE_LIMIT = 20

function TradeHistory(props: {
  allowUserFilter: boolean
  chainId?: number | null
  account?: string
  showFilter?: boolean
  dataMode: 'pagination' | 'scroll'
}) {
  const { chainId, account, showFilter, dataMode, allowUserFilter } = props
  const rwaTokens = useRwaTokens()

  const tradeHistoryFilters = useOrderFilterStore(state => state.tradeHistoryFilters)
  const updateTradeHistoryFilters = useOrderFilterStore(state => state.updateTradeHistoryFilters)

  const onUserSelectedDataRangeChanged = (dateRange: { startTime?: number; endTime?: number }) => {
    updateTradeHistoryFilters({
      startTime: dateRange.startTime,
      endTime: dateRange.endTime,
    })
  }

  const filters = useMemo(() => {
    if (!allowUserFilter) {
      return {
        limit: PAGE_LIMIT,
        startTime: tradeHistoryFilters.startTime,
        endTime: tradeHistoryFilters.endTime,
      }
    }
    const userSelectFilter = generateTradeHistoryFilterObj(tradeHistoryFilters)

    return userSelectFilter
  }, [tradeHistoryFilters, allowUserFilter])

  return (
    <>
      {showFilter && (
        <div className='flex flex-row gap-4.5 px-4 mb-3'>
          {/* <DropDownFilter
            data={tradeHistoryFilters.orderType}
            onDataChange={(reduce: (prev: string[]) => string[]) =>
              updateTradeHistoryFilters({
                orderType: reduce(tradeHistoryFilters.orderType),
              })
            }
            items={[
              { key: 'limit', value: '0' },
              { key: 'market', value: '1' },
            ]}
            title={'orderType'}
          /> */}
          <DropDownFilter
            data={tradeHistoryFilters.side}
            onDataChange={(reduce: (prev: string[]) => string[]) =>
              updateTradeHistoryFilters({
                side: reduce(tradeHistoryFilters.side),
              })
            }
            items={[
              { key: 'buy', value: '0' },
              { key: 'sell', value: '1' },
            ]}
            title={'orderSide'}
          />
          <DropDownFilter
            data={tradeHistoryFilters.stockIds}
            onDataChange={(reduce: (prev: string[]) => string[]) =>
              updateTradeHistoryFilters({
                stockIds: reduce(tradeHistoryFilters.stockIds),
              })
            }
            itemRender={item => {
              const token = rwaTokens.find(token => token.stockId.toString() === item.value)
              return (
                <TokenFilterItem icon={token?.icon} symbol={token?.symbol} name={token?.name} />
              )
            }}
            items={rwaTokens.map(token => ({
              key: token.stockId.toString(),
              value: token.stockId.toString(),
              label: token?.symbol || token?.name,
            }))}
            title={'token'}
          />
          <DatePickerWithRange
            userSelectedDateRange={{
              from: tradeHistoryFilters.startTime,
              end: tradeHistoryFilters.endTime,
            }}
            onUserSelectedDataRangeChanged={onUserSelectedDataRangeChanged}
          />
        </div>
      )}
      <OrderTable<ITrade, ITradeHistoryFilter & { limit?: number }>
        chainId={chainId}
        dataMode={dataMode}
        PAGE_LIMIT={PAGE_LIMIT}
        account={account}
        api={scanApi.getTrades}
        scrollId={(item: ITrade) => item.id}
        filter={filters}
        tableConfig={tradeHistoryTableConfig}
        type="trade"
      />
    </>
  )
}

const tradeHistoryTableConfig: ITableConfig<ITrade, { rwaTokens: IRwa[]; refetch: () => void; onTokenClick?: (rwa: IRwa) => void }> = [
  {
    key: 'side',
    sortable: false,
    render: (item: ITrade) => <SideCell side={item.side} />,
    width: 60,
  },
  // {
  //   key: 'type',
  //   sortable: false,
  //   render: (item: ITrade) => <OrderTypeCell orderType={item.orderType} />,
  //   width: 60,
  // },
  {
    key: 'token',
    sortable: false,
    render: (item: ITrade, { rwaTokens, onTokenClick }: { rwaTokens: IRwa[], onTokenClick?: (rwa: IRwa) => void }) => {
      const rwa = rwaTokens.find(token => token.stockId === item.stockId)
      return (
        <TokenCell
          tokenClassName='text-xs/4'
          nameClassName='text-gray-400 text-xs/[15px]'
          token={rwa?.symbol}
          name={rwa?.name}
          onClick={() => onTokenClick?.(rwa!)}
        />
      )
    },
  },
  {
    key: 'filledAmount',
    sortable: false,
    render: (item: ITrade, { rwaTokens }: { rwaTokens: IRwa[] }) => (
      <AmountCell amount={item.size} />
    ),
  },
  {
    key: 'tradeValue',
    sortable: false,
    render: (item: ITrade) => <ValueCell value={toFixed(item.amount)} currency={item.currency} />,
  },
  {
    key: 'avgPrice',
    sortable: false,
    render: (item: ITrade) => (
      <TextCell text={textPrefix(toFixed(divide(item.amount, item.size), 2), '$')} />
    ),
  },
  {
    key: 'executionTime',
    sortable: false,
    breakOnSpace: false,
    render: (item: ITrade) => <TextCell className='w-[80px]' text={formatTimestamp(item.txTime)} />,
  },
  {
    key: 'txHash',
    sortable: false,
    width: 120,
    render: (item: ITrade) => <TxHashCell hash={item.txHash} />,
  },
]

export default TradeHistory
