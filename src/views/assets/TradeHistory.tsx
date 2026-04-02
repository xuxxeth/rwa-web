import { useRef, useEffect, useMemo } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import {
  DropDownFilter,
  TextCell,
  TokenCell,
  SideCell,
  TxHashCell,
  OrderTypeCell,
  ScrollLoadMore,
  AmountCell,
  ValueCell,
  TokenFilterItem,
  isRiskLocked,
  RiskLockFlag,
} from './Shared'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { infiniteTradeHistoryOptions, tradeHistoryOptions } from '@/queries'
import { noop, formatTimestamp, toFixed, textPrefix, textSuffix, divide } from '@/utils'
import { type ITrade } from '@/service/scan/types'
import { type IRwa } from '@/service/base/types'
import { TableHeader, TableBody, type ITableConfig } from '@/components/table-header'
import { useOrderFilterStore, generateTradeHistoryFilterObj } from '@/stores/orderFilterStore'
import { useSignatureValidStatus } from '@/hooks/useSignature'
import SignatureVerify from '@/components/signature-verify'
import { DatePickerWithRange } from '@/components/date-range-picker'
import { type OrderChanged } from './Shared'

function TradeHistory(props: {
  chainId: number
  account: string
  rwaTokens: IRwa[]
  orderChanged: OrderChanged | null
}) {
  const { chainId, account, rwaTokens, orderChanged } = props
  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()

  const tradeHistoryFilters = useOrderFilterStore(state => state.tradeHistoryFilters)
  const updateTradeHistoryFilters = useOrderFilterStore(state => state.updateTradeHistoryFilters)

  const onUserSelectedDataRangeChanged = (dateRange: { startTime?: number; endTime?: number }) => {
    updateTradeHistoryFilters({
      startTime: dateRange.startTime,
      endTime: dateRange.endTime,
    })
  }

  const filters = useMemo(() => {
    const userSelectFilter = generateTradeHistoryFilterObj(tradeHistoryFilters)
    const otherFilter = {
      limit: 10,
    }
    return { ...userSelectFilter, ...otherFilter }
  }, [tradeHistoryFilters])

  const {
    data,
    isLoading,
    status: queryStatus,
    isError,
    refetch,
    error,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    isFetchedAfterMount,
  } = useInfiniteQuery(
    infiniteTradeHistoryOptions(account, chainId, isSignatureValid, filters, {
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

  // 用于检测滚动到底部的ref
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

  const allTrads = data?.pages.flatMap(page => page.data) || []

  return (
    <>
      <div className='flex flex-row gap-4'>
        <DropDownFilter
          data={tradeHistoryFilters.stockIds}
          onDataChange={(reduce: (prev: string[]) => string[]) =>
            updateTradeHistoryFilters({
              stockIds: reduce(tradeHistoryFilters.stockIds),
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
          title='orderSide'
        />
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
        <DatePickerWithRange
          userSelectedDateRange={{
            from: tradeHistoryFilters.startTime,
            end: tradeHistoryFilters.endTime,
          }}
          onUserSelectedDataRangeChanged={onUserSelectedDataRangeChanged}
        />
      </div>
      <TableHeader<'', ITrade, { rwaTokens: IRwa[] }>
        lngPrefix='assets.tradeHistory.tableHeader'
        config={tradeHistoryTableConfig}
        sort={null}
        className='border-none bg-white/4 rounded-md text-60'
        onSortChange={noop}
      />
      {isSignatureValid ? (
        <>
          <TableBody
            data={allTrads}
            config={tradeHistoryTableConfig}
            extra={{ rwaTokens }}
            getKey={(item: ITrade) => item.id}
            className='border-none rounded-lg hover:bg-white/10'
            // dynamicClassName={(item: ITrade) =>
            //   isRiskLocked(item.riskType)
            //     ? 'bg-[rgba(246,70,93,0.1)] hover:bg-[rgba(246,70,93,0.2)] relative'
            //     : 'hover:bg-white/10'
            // }
            // ExtraComponent={({ item }: { item: ITrade }) =>
            //   isRiskLocked(item.riskType) ? <RiskLockFlag riskType={item.riskType} /> : null
            // }
          />
          <ScrollLoadMore<ITrade>
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            data={allTrads}
            isLoading={isLoading}
            loadMoreRef={loadMoreRef}
            type="trade"
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

const tradeHistoryTableConfig: ITableConfig<ITrade, { rwaTokens: IRwa[] }> = [
  {
    key: 'side',
    sortable: false,
    render: (item: ITrade) => <SideCell side={item.side} />,
    width: 60,
  },
  {
    key: 'type',
    sortable: false,
    render: (item: ITrade) => <OrderTypeCell orderType={item.orderType} />,
    width: 60,
  },
  {
    key: 'token',
    sortable: false,
    render: (item: ITrade, { rwaTokens }: { rwaTokens: IRwa[] }) => {
      const rwa = rwaTokens.find(token => token.stockId === item.stockId)
      return <TokenCell icon={rwa?.icon} token={rwa?.symbol} name={rwa?.name} />
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
    key: 'avgPrice',
    sortable: false,
    render: (item: ITrade) => (
      <TextCell text={textPrefix(toFixed(divide(item.amount, item.size), 2), '$')} />
    ),
  },
  {
    key: 'tradeValue',
    sortable: false,
    render: (item: ITrade) => <ValueCell value={item.amount} currency={item.currency} />,
  },
  {
    key: 'time',
    sortable: false,
    breakOnSpace: true,
    render: (item: ITrade) => <TextCell className='w-[80px]' text={formatTimestamp(item.txTime)} />,
  },
  {
    key: 'txHash',
    sortable: false,
    render: (item: ITrade) => <TxHashCell hash={item.txHash} />,
  },
]

export default TradeHistory
