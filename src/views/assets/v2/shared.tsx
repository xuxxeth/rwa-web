import { useSignatureValidStatus } from '@/hooks/useSignature'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SignatureVerify from '@/components/signature-verify'
import NoRecord from '@/components/no-record'
import { TableHeader, TableBody, type ITableConfig } from '@/components/table-header'
import { type IRwa, type IToken } from '@/service/base/types'
import Pagination from '@/components/pagination'
import { useRwaTokens, useTokens } from '@/hooks/useTokens'
import { noop, cn } from '@/utils'
import { dataTagSymbol, useInfiniteQuery } from '@tanstack/react-query'
import { infiniteOrderOptions } from '@/queries'
import { ScrollLoadMore } from '../Shared'
import { useWssStore } from '@/stores/wssStore'
import { WalletNotConnectedSmallVersion } from '@/components/wallet-not-connected'
import { useRouter } from '@/hooks/useRouter'

// export function useOrderChanged() {
// const [orderChanged, _setOrderChanged] = useState<OrderChanged | null>(null)
// const newOrder = useWssStore(state => state.newOrder)

// const setOrderChanged = (orderChanged: OrderChanged | null) => {
//   _setOrderChanged(prev => {
//     if (checkOrderChangedEqual(orderChanged, prev)) {
//       return prev
//     }
//     return orderChanged
//   })
// }

// useEffect(() => {
//   if (newOrder === null) return
//   const newOrderChanged = {
//     orderId: String(newOrder.id),
//     status: newOrder.x,
//     eventTime: newOrder.E,
//     details: newOrder
//   }
//   setOrderChanged(newOrderChanged)
// }, [newOrder])

// return orderChanged
// }

export function useOrderList<
  T extends { orderId?: string; id: string },
  F extends { after?: string; before?: string },
>(
  chainId: number,
  account: string,
  PAGE_LIMIT: number,
  scrollId: (item: T) => string,
  api: (filter: F) => Promise<{ data: T[] }>,
  filter: F,
  sorter?: (a: T, b: T) => number
) {
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [isPrevEnabled, setIsPrevEnabled] = useState(false)
  const [isNextEnabled, setIsNextEnabled] = useState(false)

  const [isListEmpty, setIsListEmpty] = useState(false)

  const [isFirstLoadDone, setIsFirstLoadDone] = useState(false)

  const [isSignatureValid, _, validSignature] = useSignatureValidStatus()

  // 如果是第一页的话，把 prev 设置为 disabled
  const fetchFirstPage = async (isAutoRefresh?: boolean) => {
    try {
      setIsLoading(!isAutoRefresh)
      setIsPrevEnabled(false)
      setIsNextEnabled(false)
      const res = await api({ ...filter, limit: PAGE_LIMIT })
      setData(res.data || [])

      if (res.data.length === 0) {
        setIsListEmpty(true)
      } else {
        setIsListEmpty(false)
      }

      if (res.data.length === PAGE_LIMIT) {
        setIsNextEnabled(true)
      }
    } catch (error) {
    } finally {
      setIsFirstLoadDone(true)
      setIsLoading(false)
    }
  }

  const tryFetchNextPage = async () => {
    try {
      if (data.length === 0) return

      setIsLoading(true)

      const params = {} as F
      params.after = scrollId(data[data.length - 1])

      const res = await api({
        ...filter,
        limit: PAGE_LIMIT,
        ...params,
      })

      const newNextData = res.data

      if (newNextData.length === 0) {
        setIsNextEnabled(false)
        return
      }

      if (newNextData.length < PAGE_LIMIT) {
        setIsNextEnabled(false)
      } else if (newNextData.length === PAGE_LIMIT) {
        setIsNextEnabled(true)
      }

      setIsPrevEnabled(true)
      setData(newNextData)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const tryFetchPrevPage = async () => {
    try {
      if (data.length === 0) return

      setIsLoading(true)

      const params = {} as F
      params.before = scrollId(data[0])

      const res = await api({
        ...filter,
        limit: PAGE_LIMIT,
        ...params,
      })

      const newPrevData = res.data

      if (newPrevData.length === 0) {
        setIsPrevEnabled(false)
        return
      }

      if (newPrevData.length < PAGE_LIMIT) {
        setIsPrevEnabled(false)
      } else if (newPrevData.length === PAGE_LIMIT) {
        setIsPrevEnabled(true)
      }

      setIsNextEnabled(true)
      setData(newPrevData)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!validSignature()) return
    fetchFirstPage()
  }, [chainId, account, isSignatureValid, filter])

  const dataToDisplay = sorter ? [...data].sort(sorter) : data

  return {
    data: dataToDisplay,
    isLoading,
    isPrevEnabled,
    isNextEnabled,
    isListEmpty,
    isFirstLoadDone,
    fetchFirstPage,
    tryFetchPrevPage,
    tryFetchNextPage,
  }
}

export function OrderTable<
  T extends { orderId?: string; id: string },
  F extends { after?: string; before?: string },
>({
  chainId,
  account,
  PAGE_LIMIT,
  api,
  filter,
  tableConfig,
  dataMode,
  scrollId,
  type,
  lngPrefix,
  scrollToTopWhenPagination,
  signatureSubTitle,
  paginationClassName,
  headerClassName,
  bodyClassName,
  paginationSorter,
  showChecked,
  onSelectRows,
  MULTI_LIMIT
}: {
  chainId?: number | null
  account?: string
  PAGE_LIMIT: number
  api: (filter: F) => Promise<{ data: T[] }>
  filter: F
  tableConfig: ITableConfig<
    T,
    {
      rwaTokens: IRwa[]
      stableTokens: IToken[]
      refetch: () => void
      onTokenClick?: (rwa: IRwa | IToken) => void
    }
  >
  dataMode: 'pagination' | 'scroll'
  scrollId: (item: T) => string
  type: TableType
  lngPrefix: string
  scrollToTopWhenPagination?: boolean
  signatureSubTitle: string
  paginationClassName?: string
  headerClassName?: string
  bodyClassName?: string
  paginationSorter?: (a: T, b: T) => number
  showChecked?: boolean,
  onSelectRows?: (keys: string[]) => void
  MULTI_LIMIT?: number
}) {
  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()
  const isOrder = ['open', 'history', 'trade'].includes(type)

  const [selectedAll, setSelectedAll] = useState(false)
  const [selectedAllRows, setSelectedAllRows] = useState(false)


  if (!chainId || !account) {
    return (
      <WithTableHeader
        tableConfig={tableConfig}
        dataMode={dataMode}
        lngPrefix={lngPrefix}
        className={headerClassName}
      >
        <WalletNotConnectedSmallVersion />
      </WithTableHeader>
    )
  }

  if (!isSignatureValid) {
    return (
      <WithTableHeader tableConfig={tableConfig} dataMode={dataMode} lngPrefix={lngPrefix}>
        <SignatureVerify
          desc='signatureVerifyDescTop'
          subDesc={signatureSubTitle}
          className={cn(isOrder ? 'mt-9' : 'mt-14', headerClassName)}
          refreshIsSignatureValid={refreshIsSignatureValid}
        />
      </WithTableHeader>
    )
  }

  return (
    <WithTableHeader
      tableConfig={tableConfig}
      dataMode={dataMode}
      lngPrefix={lngPrefix}
      className={headerClassName}
        showChecked={showChecked}
        isAllSelected={selectedAllRows}
        onSelectAll={(checked) => {
          setSelectedAll(checked)
        }}
    >
      {dataMode === 'pagination' && (
        <OrderContentByPagination<T, F>
          chainId={chainId}
          account={account}
          PAGE_LIMIT={PAGE_LIMIT}
          scrollToTopWhenPagination={scrollToTopWhenPagination}
          api={api}
          filter={filter}
          scrollId={scrollId}
          tableConfig={tableConfig}
          type={type}
          paginationClassName={paginationClassName}
          bodyClassName={bodyClassName}
          paginationSorter={paginationSorter}
          showChecked={showChecked}
          selectedAll={selectedAll}
          MULTI_LIMIT={MULTI_LIMIT}
          onSelectAllConsumed={() => {
            setSelectedAll(false)
          }}
          onSelectRows={(keys: string[], isSelectedAll: boolean) => {
            setSelectedAllRows(isSelectedAll)
            onSelectRows?.(keys)
          }}
        />
      )}
      {dataMode === 'scroll' && (
        <OrderContentByScroll<T, F>
          chainId={chainId}
          account={account}
          api={api}
          scrollId={scrollId}
          filter={filter}
          tableConfig={tableConfig}
          isSignatureValid={isSignatureValid}
          refreshIsSignatureValid={refreshIsSignatureValid}
          type={type}
        />
      )}
    </WithTableHeader>
  )
}

function WithTableHeader<T extends { orderId?: string }>({
  children,
  tableConfig,
  lngPrefix,
  className,
  showChecked,
  onSelectAll,
  isAllSelected
}: {
  children: React.ReactNode
  tableConfig: ITableConfig<
    T,
    {
      rwaTokens: IRwa[]
      stableTokens: IToken[]
      refetch: () => void
      onTokenClick?: (rwa: IRwa | IToken) => void
    }
  >
  dataMode: 'pagination' | 'scroll'
  lngPrefix: string
  className?: string
  showChecked?: boolean
  onSelectAll?: (checked: boolean) => void
  isAllSelected?: boolean
}) {
  return (
    <>
      <TableHeader<
        '',
        T,
        {
          rwaTokens: IRwa[]
          stableTokens: IToken[]
          refetch: () => void
          onTokenClick?: (rwa: IRwa | IToken) => void
        }
      >
        lngPrefix={lngPrefix}
        config={tableConfig}
        sort={null}
        className={cn('border-none h-7 px-4', 'bg-gray-900', className)}
        thClassName={cn('text-gray-400 text-xs/[15px] font-normal')}
        onSortChange={noop}
        showChecked={showChecked}
        onSelectAll={onSelectAll}
        isAllSelected={isAllSelected}
      />
      {children}
    </>
  )
}

export type TableType =
  | 'open'
  | 'history'
  | 'trade'
  | 'invitee'
  | 'rebate'
  | 'claim'
  | 'tokenExchanged'
  | 'riskAssets'

export function OrderContentByScroll<
  T extends { orderId?: string; id: string },
  F extends { after?: string; before?: string },
>({
  api,
  chainId,
  account,
  filter,
  tableConfig,
  isSignatureValid,
  scrollId,
  refreshIsSignatureValid,
  type,
}: {
  chainId: number
  account: string
  filter: F
  api: (filter: F) => Promise<{ data: T[] }>
  tableConfig: ITableConfig<
    T,
    {
      rwaTokens: IRwa[]
      stableTokens: IToken[]
      refetch: () => void
      onTokenClick?: (rwa: IRwa | IToken) => void
    }
  >
  isSignatureValid: boolean
  refreshIsSignatureValid: (_isValid: boolean) => void
  scrollId: (item: T) => string
  type: TableType
}) {
  const router = useRouter()
  const stableTokens = useTokens()
  const rwaTokens = useRwaTokens(true)

  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isLoading,
    isError,
    isFetchedAfterMount,
  } = useInfiniteQuery(
    infiniteOrderOptions(api, account, chainId, isSignatureValid, scrollId, filter, {
      onUnAuthorized: () => {
        refreshIsSignatureValid(false)
      },
    })
  )

  const needRefreshedWhenOrderChanged = ['open', 'history', 'trade'].includes(type)
  const isRefetchEnable = isFetchedAfterMount && !isLoading && needRefreshedWhenOrderChanged
  useOrderChangedV2(isAutoRefresh => refetch(), isRefetchEnable)

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

  const onTokenClick = (rwa: IRwa | IToken) => {
    router.push(`/trade/${rwa.symbol}`)
  }

  return (
    <div className='flex-1 overflow-auto scrollbar-hide cursor-pointer'>
      <TableBody<
        T,
        {
          rwaTokens: IRwa[]
          stableTokens: IToken[]
          refetch: () => void
          onTokenClick?: (rwa: IRwa | IToken) => void
        }
      >
        data={allOrders}
        config={tableConfig}
        extra={{ rwaTokens, stableTokens, refetch, onTokenClick }}
        getKey={(item: T) => item.id}
        isLoading={isLoading}
        className={cn('hover:bg-opacity-01 px-4 group')}
        tdClassName='h-[46px] text-xs/4'
      />
      <ScrollLoadMore<T>
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        data={allOrders}
        isLoading={isLoading}
        loadMoreRef={loadMoreRef}
        type={type}
      />
    </div>
  )
}

export function useOrderChangedV2(
  refetch: (isAutoRefresh?: boolean) => Promise<any>,
  isRefetchEnable: boolean
) {
  const newOrder = useWssStore(state => state.newOrder)
  const preNewOrder = useRef(newOrder)

  const refetchTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([])
  const lastOrderChangedEventTimeRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      refetchTimersRef.current.forEach(clearTimeout)
      refetchTimersRef.current = []
    }
  }, [])

  useEffect(() => {
    if (!isRefetchEnable) return
    if (!newOrder) return
    if (newOrder === preNewOrder.current) return

    const rawEventTime = newOrder.E
    const parsedTs = Number(rawEventTime)
    const ts = Number.isFinite(parsedTs) && parsedTs > 0 ? parsedTs : Date.now()

    if (ts === lastOrderChangedEventTimeRef.current) return
    lastOrderChangedEventTimeRef.current = ts

    refetchTimersRef.current.forEach(clearTimeout)
    refetchTimersRef.current = []

    const delays = [200, 600, 1500, 2800]

    delays.forEach((delay, index) => {
      refetchTimersRef.current.push(
        setTimeout(() => {
          refetch(true)
        }, delay)
      )
    })
  }, [newOrder, isRefetchEnable, refetch])
}

export function OrderContentByPagination<
  T extends { orderId?: string; id: string },
  F extends { after?: string; before?: string },
>({
  chainId,
  account,
  PAGE_LIMIT,
  api,
  filter,
  tableConfig,
  scrollId,
  scrollToTopWhenPagination,
  type,
  paginationClassName,
  bodyClassName,
  paginationSorter,
  showChecked,
  selectedAll,
  MULTI_LIMIT,
  onSelectAllConsumed,
  onSelectRows
}: {
  chainId: number
  account: string
  PAGE_LIMIT: number
  api: (filter: F) => Promise<{ data: T[] }>
  scrollId: (item: T) => string
  filter: F
  tableConfig: ITableConfig<
    T,
    {
      rwaTokens: IRwa[]
      stableTokens: IToken[]
      refetch: () => void
      onTokenClick?: (rwa: IRwa | IToken) => void
    }
  >
  scrollToTopWhenPagination?: boolean
  type: TableType
  paginationClassName?: string
  bodyClassName?: string
  paginationSorter?: (a: T, b: T) => number
  showChecked?: boolean
  selectedAll?: boolean
  MULTI_LIMIT?: number
  onSelectAllConsumed?: () => void
  onSelectRows?: (keys: string[], isAllSelected: boolean) => void
}) {
  const stableTokens = useTokens()
  const rwaTokens = useRwaTokens()

  const {
    data,
    isLoading,
    isPrevEnabled,
    isNextEnabled,
    isListEmpty,
    fetchFirstPage,
    tryFetchPrevPage,
    tryFetchNextPage,
    isFirstLoadDone,
  } = useOrderList<T, F>(chainId, account, PAGE_LIMIT, scrollId, api, filter, paginationSorter)

  const needRefreshedWhenOrderChanged = ['open', 'history', 'trade'].includes(type)
  const isRefetchEnable = isFirstLoadDone && needRefreshedWhenOrderChanged
  useOrderChangedV2(fetchFirstPage, isRefetchEnable)

  const onTokenClick = (rwa: IRwa | IToken) => {
    window.open(`/trade/${rwa.symbol}`, '_blank')
  }

  const isOrder = ['open', 'history', 'trade'].includes(type)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const currentPageKeys = useMemo(() => data.map(item => String(scrollId(item))), [data, scrollId])
  const currentPageKeySignature = currentPageKeys.join('|')
  const pageSelectionMapRef = useRef(new Map<string, string[]>())

  const emitSelection = useCallback((nextKeys: string[]) => {
    const isAllSelected = currentPageKeys.length > 0 && currentPageKeys.every(key => nextKeys.includes(key))
    pageSelectionMapRef.current.set(currentPageKeySignature, nextKeys)
    setSelectedRowKeys(nextKeys)
    onSelectRows?.(nextKeys, isAllSelected)
  }, [currentPageKeys, currentPageKeySignature, onSelectRows])

  useEffect(() => {
    const persistedSelection = pageSelectionMapRef.current.get(currentPageKeySignature) ?? []
    setSelectedRowKeys(persistedSelection)

    const isAllSelected = currentPageKeys.length > 0 && currentPageKeys.every(key => persistedSelection.includes(key))
    onSelectRows?.(persistedSelection, isAllSelected)
  }, [currentPageKeySignature, currentPageKeys, onSelectRows])

  useEffect(() => {
    if (!showChecked || !selectedAll) return

    const limit = MULTI_LIMIT ?? currentPageKeys.length
    const keys = currentPageKeys.slice(0, limit)
    emitSelection(keys)
    onSelectAllConsumed?.()
  }, [selectedAll, showChecked, currentPageKeys, MULTI_LIMIT, emitSelection, onSelectAllConsumed])


  if (isListEmpty) {
    return <NoRecord className={isOrder ? '' : 'mt-14'} />
  }

  return (
    <>
      <TableBody<
        T,
        {
          rwaTokens: IRwa[]
          stableTokens: IToken[]
          refetch: () => void
          onTokenClick?: (rwa: IRwa | IToken) => void
        }
      >
        data={data}
        isLoading={isLoading}
        config={tableConfig}
        extra={{ rwaTokens, stableTokens: stableTokens, refetch: fetchFirstPage, onTokenClick }}
        getKey={(item: T) => scrollId(item)}
        className={cn('hover:bg-opacity-01 px-4 group', bodyClassName)}
        tdClassName='h-[56px] text-xs/4'
        showChecked={showChecked}
        selectedRowKeys={selectedRowKeys}
        onSelectRow={(key: string, checked: boolean) => {
          const nextKeys = [...selectedRowKeys]
          const currentIndex = nextKeys.findIndex(_key => _key === key)

          if (checked) {
            if (currentIndex === -1 && nextKeys.length >= (MULTI_LIMIT ?? currentPageKeys.length)) {
              return
            }
            if (currentIndex === -1) {
              nextKeys.push(key)
            }
          } else if (currentIndex > -1) {
            nextKeys.splice(currentIndex, 1)
          }

          emitSelection(nextKeys)
        }}
      />
      {(data.length === PAGE_LIMIT || isPrevEnabled || isNextEnabled) && (
        <div className='mt-2'>
          <Pagination
            prevDisabled={!isPrevEnabled}
            nextDisabled={!isNextEnabled}
            onPrevClick={() => {
              tryFetchPrevPage()
            }}
            className={paginationClassName}
            scrollToTopWhenPagination={scrollToTopWhenPagination}
            onNextClick={() => {
              tryFetchNextPage()
            }}
          />
        </div>
      )}
    </>
  )
}
