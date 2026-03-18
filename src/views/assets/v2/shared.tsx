import { useSignatureValidStatus } from '@/hooks/useSignature'
import { useEffect, useState, useRef } from 'react'
import SignatureVerify from '@/components/signature-verify'
import NoRecord from '@/components/no-record'
import { TableHeader, TableBody, type ITableConfig } from '@/components/table-header'
import { type IRwa } from '@/service/base/types'
import Pagination from '@/components/pagination'
import { useRwaTokens } from '@/hooks/useTokens'
import { noop, cn } from '@/utils'
import { useInfiniteQuery } from '@tanstack/react-query'
import { infiniteOrderOptions } from '@/queries'
import { ScrollLoadMore, type OrderChanged, checkOrderChangedEqual } from '../Shared'
import { useWssStore } from '@/stores/wssStore'
import { WalletNotConnectedSmallVersion } from '@/components/wallet-not-connected'
import { useRouter } from '@/hooks/useRouter'
import { ta } from 'date-fns/locale'

export function useOrderChanged() {
  const [orderChanged, _setOrderChanged] = useState<OrderChanged | null>(null)
  const newOrder = useWssStore(state => state.newOrder)

  const setOrderChanged = (orderChanged: OrderChanged | null) => {
    _setOrderChanged(prev => {
      if (checkOrderChangedEqual(orderChanged, prev)) {
        return prev
      }
      return orderChanged
    })
  }

  useEffect(() => {
    if (newOrder === null) return
    const newOrderChanged = {
      orderId: String(newOrder.id),
      status: newOrder.x,
      eventTime: newOrder.E,
    }
    setOrderChanged(newOrderChanged)
  }, [newOrder])

  return orderChanged
}

export function useOrderList<
  T extends { orderId: string; id: string },
  F extends { after?: string; before?: string },
>(
  chainId: number,
  account: string,
  PAGE_LIMIT: number,
  scrollId: (item: T) => string,
  api: (filter: F) => Promise<{ data: T[] }>,
  filter: F
) {
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [isPrevEnabled, setIsPrevEnabled] = useState(false)
  const [isNextEnabled, setIsNextEnabled] = useState(false)

  const [isListEmpty, setIsListEmpty] = useState(false)

  const [isFirstLoadDone, setIsFirstLoadDone] = useState(false)

  // 如果是第一页的话，把 prev 设置为 disabled
  const fetchFirstPage = async () => {
    try {
      setIsLoading(true)
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
    fetchFirstPage()
  }, [chainId, account, filter])

  return {
    data,
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
  T extends { orderId: string; id: string },
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
}: {
  chainId?: number | null
  account?: string
  PAGE_LIMIT: number
  api: (filter: F) => Promise<{ data: T[] }>
  filter: F
  tableConfig: ITableConfig<T, { rwaTokens: IRwa[]; refetch: () => void, onTokenClick?: (rwa: IRwa) => void }>
  dataMode: 'pagination' | 'scroll'
  scrollId: (item: T) => string
  type: 'open' | 'history' | 'trade'
}) {
  if (!chainId || !account) {
    return (
      <WithTableHeader tableConfig={tableConfig} dataMode={dataMode}>
        <WalletNotConnectedSmallVersion />
      </WithTableHeader>
    )
  }

  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()

  if (!isSignatureValid) {
    return (
      <WithTableHeader tableConfig={tableConfig} dataMode={dataMode}>
        <SignatureVerify
          desc='signatureVerifyDescTop'
          subDesc='signatureVerifyDescBottom'
          className='mt-9'
          refreshIsSignatureValid={refreshIsSignatureValid}
        />
      </WithTableHeader>
    )
  }

  return (
    <WithTableHeader tableConfig={tableConfig} dataMode={dataMode}>
      {dataMode === 'pagination' && (
        <OrderContentByPagination<T, F>
          chainId={chainId}
          account={account}
          PAGE_LIMIT={PAGE_LIMIT}
          api={api}
          filter={filter}
          scrollId={scrollId}
          tableConfig={tableConfig}
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

function WithTableHeader<T extends { orderId: string }>({
  children,
  tableConfig,
  dataMode,
}: {
  children: React.ReactNode
  tableConfig: ITableConfig<T, { rwaTokens: IRwa[]; refetch: () => void, onTokenClick?: (rwa: IRwa) => void }>
  dataMode: 'pagination' | 'scroll'
}) {
  return (
    <>
      <TableHeader<'', T, { rwaTokens: IRwa[]; refetch: () => void, onTokenClick?: (rwa: IRwa) => void }>
        lngPrefix='portfolio.orderTable'
        config={tableConfig}
        sort={null}
        className={cn('border-none h-7 px-4', 'bg-gray-900')}
        thClassName={cn('text-gray-400 text-xs/[15px] font-normal')}
        onSortChange={noop}
      />
      {children}
    </>
  )
}

export function OrderContentByScroll<
  T extends { orderId: string; id: string },
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
  tableConfig: ITableConfig<T, { rwaTokens: IRwa[]; refetch: () => void, onTokenClick?: (rwa: IRwa) => void }>
  isSignatureValid: boolean
  refreshIsSignatureValid: (_isValid: boolean) => void
  scrollId: (item: T) => string
  type: 'open' | 'history' | 'trade'
}) {
  const router = useRouter()
  const rwaTokens = useRwaTokens()

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

  const orderChanged = useOrderChanged()

  useEffect(() => {
    if (!isFetchedAfterMount) return
    if (isLoading) return
    if (!orderChanged) return

    refetch()
  }, [orderChanged, isFetchedAfterMount, isLoading])

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

  const onTokenClick = (rwa: IRwa) => { 
    console.log('rwa', rwa)
    router.push(`/trade/${rwa.symbol}`)
  }

  return (
    <div className='flex-1 overflow-auto scrollbar-hide cursor-pointer'>
      <TableBody<T, { rwaTokens: IRwa[]; refetch: () => void, onTokenClick?: (rwa: IRwa) => void }>
        data={allOrders}
        config={tableConfig}
        extra={{ rwaTokens, refetch, onTokenClick }}
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

export function OrderContentByPagination<
  T extends { orderId: string; id: string },
  F extends { after?: string; before?: string },
>({
  chainId,
  account,
  PAGE_LIMIT,
  api,
  filter,
  tableConfig,
  scrollId,
}: {
  chainId: number
  account: string
  PAGE_LIMIT: number
  api: (filter: F) => Promise<{ data: T[] }>
  scrollId: (item: T) => string
  filter: F
  tableConfig: ITableConfig<T, { rwaTokens: IRwa[]; refetch: () => void, onTokenClick?: (rwa: IRwa) => void }>
}) {
  const router = useRouter()
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
  } = useOrderList<T, F>(chainId, account, PAGE_LIMIT, scrollId, api, filter)

  const orderChanged = useOrderChanged()

  useEffect(() => {
    if (orderChanged === null) return
    if (!isFirstLoadDone) return
    fetchFirstPage()
  }, [orderChanged, isFirstLoadDone])

  const onTokenClick = (rwa: IRwa) => {
    // router.push(`/trade/${rwa.symbol}`)
    window.open(`/trade/${rwa.symbol}`, '_blank')
  }

  if (isListEmpty) {
    return <NoRecord />
  }

  return (
    <>
      <TableBody<T, { rwaTokens: IRwa[]; refetch: () => void, onTokenClick?: (rwa: IRwa) => void }>
        data={data}
        isLoading={isLoading}
        config={tableConfig}
        extra={{ rwaTokens, refetch: fetchFirstPage, onTokenClick }}
        getKey={(item: T) => item.orderId}
        className={cn('hover:bg-opacity-01 px-4 group')}
        tdClassName='h-[56px] text-xs/4'
      />
      {(data.length === PAGE_LIMIT || isPrevEnabled || isNextEnabled) && (
        <div className='mt-2'>
          <Pagination
            prevDisabled={!isPrevEnabled}
            nextDisabled={!isNextEnabled}
            onPrevClick={() => {
              tryFetchPrevPage()
            }}
            onNextClick={() => {
              tryFetchNextPage()
            }}
          />
        </div>
      )}
    </>
  )
}
