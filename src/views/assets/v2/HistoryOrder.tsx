import {
  SideCell,
  TokenCell,
  OrderStatusCell,
  ValueCell,
  AmountCell,
  TextCell,
  TradingFees,
  OrderTypeCell,
  DropDownFilter,
  filledStatus,
  failedStatus,
  cancelledStatus,
  TokenFilterItem,
  TxHashCell,
  ReasonCell,
  SessionTypeCell,
} from '../Shared'
import { type IRwa } from '@/service/base/types'
import { useRwaTokens } from '@/hooks/useTokens'
import { useOrderFilterStore } from '@/stores/orderFilterStore'
import { useMemo } from 'react'
import { scanApi } from '@/service/scan/api'
import { type ITableConfig } from '@/components/table-header'
import { type IOrder } from '@/service/scan/types'
import { type IOrderHistoryFilter } from '@/stores/orderFilterStore'
import { textPrefix, toFixed, formatTimestamp, divide, truncate } from '@/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { generateOrderHistoryFilterObj } from '@/stores/orderFilterStore'
import { DatePickerWithRange } from '@/components/date-range-picker'
import { OrderTable } from './shared'

const PAGE_LIMIT = 20

function HistoryOrder(props: {
  allowUserFilter: boolean
  chainId?: number | null
  account?: string
  showFilter?: boolean
  dataMode: 'pagination' | 'scroll'
}) {
  const { chainId, account, showFilter, dataMode, allowUserFilter } = props
  const rwaTokens = useRwaTokens()

  const orderHistoryFilters = useOrderFilterStore(state => state.orderHistoryFilters)
  const updateOrderHistoryFilters = useOrderFilterStore(state => state.updateOrderHistoryFilters)

  const onUserSelectedDataRangeChanged = (dateRange: { startTime?: number; endTime?: number }) => {
    updateOrderHistoryFilters({
      startTime: dateRange.startTime,
      endTime: dateRange.endTime,
    })
  }

  const filters = useMemo(() => {
    if (!allowUserFilter) {
      return {
        limit: PAGE_LIMIT,
        startTime: orderHistoryFilters.startTime,
        endTime: orderHistoryFilters.endTime,
      }
    }
    const userSelectFilter = generateOrderHistoryFilterObj(orderHistoryFilters)
    return userSelectFilter
  }, [orderHistoryFilters, allowUserFilter])

  return (
    <>
      {showFilter && (
        <div className='flex flex-row gap-4.5 px-4 mb-3'>
          <DropDownFilter
            data={orderHistoryFilters.orderType}
            onDataChange={(reduce: (prev: string[]) => string[]) =>
              updateOrderHistoryFilters({
                orderType: reduce(orderHistoryFilters.orderType),
              })
            }
            items={[
              { key: 'limit', value: '0' },
              { key: 'market', value: '1' },
            ]}
            title={'orderType'}
          />
          <DropDownFilter
            data={orderHistoryFilters.side}
            onDataChange={(reduce: (prev: string[]) => string[]) =>
              updateOrderHistoryFilters({
                side: reduce(orderHistoryFilters.side),
              })
            }
            items={[
              { key: 'buy', value: '0' },
              { key: 'sell', value: '1' },
            ]}
            title={'orderSide'}
          />
          <DropDownFilter
            data={orderHistoryFilters.states}
            onDataChange={(reduce: (prev: string[]) => string[]) =>
              updateOrderHistoryFilters({
                states: reduce(orderHistoryFilters.states),
              })
            }
            title={'orderStatus'}
            items={[
              {
                key: 'filled',
                value: filledStatus.value.join(','),
              },
              {
                key: 'cancelled',
                value: cancelledStatus.value.join(','),
              },
              {
                key: 'failed',
                value: failedStatus.value.join(','),
              },
            ]}
          />
          <DropDownFilter
            data={orderHistoryFilters.stockIds}
            onDataChange={(reduce: (prev: string[]) => string[]) =>
              updateOrderHistoryFilters({
                stockIds: reduce(orderHistoryFilters.stockIds),
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
              from: orderHistoryFilters.startTime,
              end: orderHistoryFilters.endTime,
            }}
            onUserSelectedDataRangeChanged={onUserSelectedDataRangeChanged}
          />
        </div>
      )}
      <OrderTable<IOrder, IOrderHistoryFilter & { limit?: number }>
        chainId={chainId}
        dataMode={dataMode}
        account={account}
        PAGE_LIMIT={PAGE_LIMIT}
        api={scanApi.getOrderHistory}
        scrollId={(item: IOrder) => item.orderId}
        filter={filters}
        tableConfig={orderHistoryTableConfig}
        type='history'
      />
    </>
  )
}

const orderHistoryTableConfig: ITableConfig<
  IOrder,
  { rwaTokens: IRwa[]; onTokenClick?: (rwa: IRwa) => void }
> = [
  {
    key: 'side',
    sortable: false,
    render: (item: IOrder) => <SideCell side={item.side} />,
    width: 60,
  },
  {
    key: 'type',
    sortable: false,
    render: (item: IOrder) => <OrderTypeCell orderType={item.orderType} />,
    width: 60,
  },
  {
    key: 'token',
    sortable: false,
    render: (
      item: IOrder,
      { rwaTokens, onTokenClick }: { rwaTokens: IRwa[]; onTokenClick?: (rwa: IRwa) => void }
    ) => {
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
    key: 'orderPrice',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOrder) => {
      if (item.orderType === 1) {
        return '--'
      }
      return (
        <TextCell text={textPrefix(truncate(item.price, Number(item.price) > 1 ? 2 : 4), '$')} />
      )
    },
  },
  {
    key: 'filledAmount',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOrder) => (
      <div className='flex flex-row items-center'>
        <AmountCell amount={item.settledSize} />
        <span className='text-sm'>/</span>
        <AmountCell amount={item.size} />
      </div>
    ),
  },
  {
    key: 'filledValue',
    breakOnSpace: false,
    sortable: false,
    render: (item: IOrder) => (
      <ValueCell value={toFixed(item.settledAmount)} currency={item.currency} />
    ),
  },
  {
    key: 'filledAvg',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOrder) => (
      <TextCell text={textPrefix(toFixed(divide(item.settledAmount, item.settledSize)), '$')} />
    ),
  },
  {
    key: 'tf',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOrder) => (
      <TradingFees currency={item.currency} commission={item.commission} fee={item.fee} />
    ),
  },
  {
    key: 'executionTime',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOrder) => (
      <TextCell
        className='w-[80px]'
        text={item.tradeTime ? formatTimestamp(item.tradeTime) : '--'}
      />
    ),
  },
  {
    key: 'status',
    sortable: false,
    render: (item: IOrder) => <OrderStatusCell state={item.state} />,
  },
  {
    key: 'session',
    sortable: false,
    render: (item: IOrder) => <SessionTypeCell sessionType={item.sessionType} />,
  },
  {
    key: 'txHash',
    sortable: false,
    width: 125,
    render: (item: IOrder) => <TxHashCell hash={item.txHash} />,
  },
  {
    key: 'details',
    sortable: false,
    width: 50,
    render: (item: IOrder) => {
      if (item.orderType === 1) {
        return '--'
      }
      return <ReasonCell reason={item.reason} />
    },
  },
]

export default HistoryOrder
