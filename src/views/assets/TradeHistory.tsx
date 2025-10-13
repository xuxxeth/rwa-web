import { useRef, useEffect, useMemo } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { DropDownFilter, TextCell, TokenCell, SideCell, TxHashCell, OrderTypeCell } from './Shared'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { infiniteTradeHistoryOptions, tradeHistoryOptions } from '@/queries'
import { noop, formatTimestamp, toFixed, textPrefix, textSuffix, divide } from '@/utils'
import { type ITrade } from '@/service/scan/types'
import { type IRwa } from '@/service/base/types'
import { TableHeader, TableBody, type ITableConfnig } from '@/components/table-header'
import { useOrderFilterStore, generateTradeHistoryFilterObj } from '@/stores/orderFilterStore'
import { useSignatureValidStatus } from '@/hooks/useSignature'
import SignatureVerify from './SignatureVerify'
import { DatePickerWithRange } from '@/components/date-range-picker'

function TradeHistory(props: { chainId: number; account: string; rwaTokens: IRwa[] }) {
  const { chainId, account, rwaTokens } = props
  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()

  const { t } = useTranslation()
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

  // const {
  //   data,
  //   isPending,
  //   status: queryStatus,
  //   isError,
  //   error,
  // } = useQuery(tradeHistoryOptions(chainId, isSignatureValid, filters));

  const {
    data,
    isLoading,
    status: queryStatus,
    isError,
    error,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(infiniteTradeHistoryOptions(chainId, isSignatureValid, filters))

  console.log('===> trade history data', data)

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
          title='side'
        />
        <DropDownFilter
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
        />
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
          />
          <div ref={loadMoreRef} className='py-4 text-center'>
            {isFetchingNextPage ? (
              <div className='text-gray-500'>加载中...</div>
            ) : hasNextPage ? (
              <div className='text-gray-400'>滚动加载更多</div>
            ) : allTrads.length > 0 ? (
              <div className='text-gray-400'>没有更多数据了</div>
            ) : null}
          </div>
          {isLoading && allTrads.length === 0 && (
            <div className='py-8 text-center text-gray-500'>加载中...</div>
          )}
          {!isLoading && allTrads.length === 0 && (
            <div className='py-8 text-center text-gray-400'>暂无数据</div>
          )}
        </>
      ) : (
        <SignatureVerify className='mt-9' refreshIsSignatureValid={refreshIsSignatureValid} />
      )}
    </>
  )
}

const tradeHistoryTableConfig: ITableConfnig<ITrade, { rwaTokens: IRwa[] }> = [
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
    width: 150,
    render: (item: ITrade, { rwaTokens }: { rwaTokens: IRwa[] }) => {
      const rwa = rwaTokens.find(token => token.stockId === item.stockId)
      return <TokenCell icon={rwa?.icon} token={rwa?.symbol} name={rwa?.name} />
    },
  },
  {
    key: 'filledQuantity',
    sortable: false,
    render: (item: ITrade, { rwaTokens }: { rwaTokens: IRwa[] }) => {
      const rwa = rwaTokens.find(token => token.stockId === item.stockId)
      return <TextCell text={textSuffix(toFixed(item.size, 4), rwa?.symbol || '')} />
    },
  },
  {
    key: 'tradeValue',
    sortable: false,
    render: (item: ITrade) => <TextCell text={textPrefix(toFixed(item.amount, 2), '$')} />,
  },
  {
    key: 'avgPrice',
    sortable: false,
    render: (item: ITrade) => (
      <TextCell text={textPrefix(toFixed(divide(item.amount, item.size), 2), '$')} />
    ),
  },
  {
    key: 'time',
    sortable: false,
    breakOnSpace: true,
    render: (item: ITrade) => <TextCell text={formatTimestamp(item.txTime)} />,
  },
  {
    key: 'txId',
    sortable: false,
    render: (item: ITrade) => <TxHashCell hash={item.txHash} />,
  },
]

export default TradeHistory
