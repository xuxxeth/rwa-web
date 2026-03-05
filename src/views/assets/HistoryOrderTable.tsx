import { useMemo, useEffect, useRef } from 'react'
import { LazyImage } from '@/components/image/LazyImage'
import { TableHeader, TableBody, type ITableConfig } from '@/components/table-header'
import { type IRwa } from '@/service/base/types'
import { orderHistoryOptions, infiniteOrderHistoryOptions } from '@/queries'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { type IOrder } from '@/service/scan/types'
import { noop } from '@/utils'
import {
  SideCell,
  TokenCell,
  OrderStatusCell,
  TextCell,
  TxHashCell,
  OrderTypeCell,
  DropDownFilter,
  ScrollLoadMore,
  AmountCell,
  ValueCell,
  filledStatus,
  partiallyFilledStatus,
  failedStatus,
  cancelledStatus,
  TokenFilterItem,
  isRiskLocked,
  RiskLockFlag,
  ReasonCell
} from './Shared'
import { textPrefix, textSuffix, toFixed, formatTimestamp } from '@/utils/format'
import { useOrderFilterStore } from '@/stores/orderFilterStore'
import SignatureVerify from '@/components/signature-verify'
import { useSignatureValidStatus } from '@/hooks/useSignature'
import { generateOrderHistoryFilterObj } from '@/stores/orderFilterStore'
import { DatePickerWithRange } from '@/components/date-range-picker'

export default function HistoryOrderTable(props: {
  chainId: number
  account: string
  rwaTokens: IRwa[]
  orderChanged: {
    orderId: string
    status: string
  } | null
}) {
  const { chainId, account, rwaTokens, orderChanged } = props

  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()

  const orderHistoryFilters = useOrderFilterStore(state => state.orderHistoryFilters)
  const updateOrderHistoryFilters = useOrderFilterStore(state => state.updateOrderHistoryFilters)

  const onUserSelectedDataRangeChanged = (dateRange: { startTime?: number; endTime?: number }) => {
    updateOrderHistoryFilters({
      startTime: dateRange.startTime,
      endTime: dateRange.endTime,
    })
  }

  const filters = useMemo(() => {
    const userSelectFilter = generateOrderHistoryFilterObj(orderHistoryFilters)
    const otherFilter = {
      limit: 10,
    }
    return { ...userSelectFilter, ...otherFilter }
  }, [orderHistoryFilters])

  const {
    data,
    fetchNextPage,
    refetch,
    isFetchedAfterMount,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isLoading,
    isError,
  } = useInfiniteQuery(
    infiniteOrderHistoryOptions(account, chainId, isSignatureValid, filters, {
      onUnAuthorized: () => {
        refreshIsSignatureValid(false)
      },
    })
  )

  useEffect(() => {
    if (!isFetchedAfterMount || isLoading || !orderChanged) return
    if (['FILLED', 'CANCELLED', 'PARTIALLY_FILLED', 'FAILED'].includes(orderChanged.status)) {
      refetch()
    }
  }, [orderChanged])

  const allOrders = data?.pages?.flatMap(page => page.data) || []

  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetching && !isFetchingNextPage) {
        // 当滚动到加载更多区域且有下一页数据时，触发加载
        fetchNextPage()
      }
    })

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage])

  return (
    <>
      <div className='flex flex-row gap-4'>
        <DropDownFilter
          data={orderHistoryFilters.stockIds}
          onDataChange={(reduce: (prev: string[]) => string[]) =>
            updateOrderHistoryFilters({
              stockIds: reduce(orderHistoryFilters.stockIds),
            })
          }
          itemRender={item => {
            const token = rwaTokens.find(token => token.stockId.toString() === item.value)
            return <TokenFilterItem icon={token?.icon} symbol={token?.symbol} name={token?.name} />
          }}
          items={rwaTokens.map(token => ({
            key: token.stockId.toString(),
            value: token.stockId.toString(),
            label: token?.symbol || token?.name,
          }))}
          title={'token'}
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
        {/* <DropDownFilter
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
        /> */}
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
        <DatePickerWithRange
          userSelectedDateRange={{
            from: orderHistoryFilters.startTime,
            end: orderHistoryFilters.endTime,
          }}
          onUserSelectedDataRangeChanged={onUserSelectedDataRangeChanged}
        />
      </div>
      <TableHeader<'', IOrder, { rwaTokens: IRwa[] }>
        lngPrefix='assets.order.tableHeader'
        config={orderHistoryTableConfig}
        sort={null}
        className='border-none bg-white/4 rounded-md text-60'
        onSortChange={noop}
      />
      {isSignatureValid ? (
        <>
          <TableBody<IOrder, { rwaTokens: IRwa[] }>
            data={allOrders}
            config={orderHistoryTableConfig}
            extra={{ rwaTokens }}
            getKey={(item: IOrder) => item.orderId}
            className='border-none rounded-lg hover:bg-white/10'
            // dynamicClassName={(item: IOrder) =>
            //   isRiskLocked(item.riskType)
            //     ? 'bg-[rgba(246,70,93,0.1)] hover:bg-[rgba(246,70,93,0.2)] relative'
            //     : 'hover:bg-white/10'
            // }
            // ExtraComponent={({ item }: { item: IOrder }) =>
            //   isRiskLocked(item.riskType) ? <RiskLockFlag riskType={item.riskType} /> : null
            // }
          />
          <ScrollLoadMore<IOrder>
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            data={allOrders}
            isLoading={isLoading}
            loadMoreRef={loadMoreRef}
            type="history"
          />
        </>
      ) : (
        <SignatureVerify
          desc='signatureVerifyDescTop'
          subDesc='signatureVerifyDescBottom'
          className='mt-9'
          refreshIsSignatureValid={refreshIsSignatureValid}
        />
      )}
    </>
  )
}

const orderHistoryTableConfig: ITableConfig<IOrder, { rwaTokens: IRwa[] }> = [
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
    render: (item: IOrder, { rwaTokens }: { rwaTokens: IRwa[] }) => {
      const rwa = rwaTokens.find(token => token.stockId === item.stockId)
      return <TokenCell icon={rwa?.icon} token={rwa?.symbol} name={rwa?.name} />
    },
  },
  {
    key: 'orderPrice',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOrder) => <TextCell text={textPrefix(toFixed(item.price), '$')} />,
  },
  {
    key: 'orderAmount',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOrder) => <AmountCell amount={item.size} />,
  },
  {
    key: 'filledAmount',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOrder) => <AmountCell amount={item.settledSize} />,
  },
  {
    key: 'filledValue',
    breakOnSpace: false,
    sortable: false,
    render: (item: IOrder) => <ValueCell value={item.settledAmount} currency={item.currency} />,
  },
  {
    key: 'executionTime',
    sortable: false,
    breakOnSpace: false,
    width: 103,
    render: (item: IOrder) => (
      <TextCell className='w-[100px]' text={formatTimestamp(item.tradeTime)} />
    ),
  },
  {
    key: 'status',
    sortable: false,
    render: (item: IOrder) => <OrderStatusCell state={item.state} />,
  },
  {
    key: 'txHash',
    sortable: false,
    width: 140,
    render: (item: IOrder) => <TxHashCell hash={item.txHash} />,
  },
  {
    key: 'details',
    sortable: false,
    width: 80,
    render: (item: IOrder) => <ReasonCell reason={item.reason} />,
  },
]
