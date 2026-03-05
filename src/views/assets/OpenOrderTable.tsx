import { TableHeader, TableBody, type ITableConfig } from '@/components/table-header'
import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { type IRwa } from '@/service/base/types'
import { openOrderOptions, infiniteOpenOrderOptions } from '@/queries'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { type IOpenOrder } from '@/service/scan/types'
import {
  SideCell,
  TokenCell,
  OrderStatusCell,
  ValueCell,
  AmountCell,
  TextCell,
  OrderTypeCell,
  DropDownFilter,
  ScrollLoadMore,
  TokenFilterItem,
  TextCellWithTranslation,
} from './Shared'
import { cn, textPrefix, toFixed, formatTimestamp, noop, readableDuration, sleep } from '@/utils'
import { useToast } from '@/hooks/useToast'
import { useOrderFilterStore, generateOpenOrderFilterObj } from '@/stores/orderFilterStore'
import { useSignatureValidStatus } from '@/hooks/useSignature'
import SignatureVerify from '@/components/signature-verify'
import { useTradeUtils } from '@/hooks/useTrading'
import { type OrderChanged } from './Shared'
import { useTxToast } from '@/hooks/useTxToast'
import { useTradeStore } from '@/stores/tradeStore'

export default function OpenOrderTable(props: {
  chainId: number
  account: string
  rwaTokens: IRwa[] 
  orderChanged: OrderChanged | null
}) {
  const { chainId, account, rwaTokens, orderChanged } = props

  const openOrderFilters = useOrderFilterStore(state => state.openOrderFilters)
  const updateOpenOrderFilters = useOrderFilterStore(state => state.updateOpenOrderFilters)

  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()

  const filter = useMemo(() => {
    const userSelectFilter = generateOpenOrderFilterObj(openOrderFilters)
    const otherFilter: Record<string, string | number> = {
      limit: 10,
    }
    return { ...userSelectFilter, ...otherFilter }
  }, [openOrderFilters])

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
    infiniteOpenOrderOptions(account, chainId, isSignatureValid, filter, {
      onUnAuthorized: () => {
        refreshIsSignatureValid(false)
      },
    })
  )

  const allOpenOrders = data?.pages?.flatMap(page => page.data) || []
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isFetchedAfterMount || isLoading || !orderChanged) return
    refetch()
  }, [orderChanged])

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
          data={openOrderFilters.stockIds}
          onDataChange={(reduce: (prev: string[]) => string[]) =>
            updateOpenOrderFilters({
              stockIds: reduce(openOrderFilters.stockIds),
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
          data={openOrderFilters.side}
          onDataChange={(reduce: (prev: string[]) => string[]) =>
            updateOpenOrderFilters({
              side: reduce(openOrderFilters.side),
            })
          }
          items={[
            { key: 'buy', value: '0' },
            { key: 'sell', value: '1' },
          ]}
          title={'orderSide'}
        />
        {/* <DropDownFilter
          data={openOrderFilters.states}
          onDataChange={(reduce: (prev: string[]) => string[]) =>
            updateOpenOrderFilters({
              states: reduce(openOrderFilters.states),
            })
          }
          items={[
            { key: "open", value: "0" },
            { key: "partiallyFilled", value: "1" },
          ]}
          title={"orderStatus"}
        /> */}
      </div>

      <TableHeader<'', IOpenOrder, { rwaTokens: IRwa[]; refetch: () => void }>
        lngPrefix='assets.order.tableHeader'
        config={openOrderTableConfig}
        sort={null}
        className='border-none bg-white/4 rounded-md text-60'
        onSortChange={noop}
      />
      {isSignatureValid ? (
        <>
          <TableBody<IOpenOrder, { rwaTokens: IRwa[]; refetch: () => void }>
            data={allOpenOrders}
            config={openOrderTableConfig}
            extra={{ rwaTokens, refetch }}
            getKey={(item: IOpenOrder) => item.id}
            className='border-none hover:bg-white/10 rounded-lg'
          />
          <ScrollLoadMore<IOpenOrder>
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            data={allOpenOrders}
            isLoading={isLoading}
            loadMoreRef={loadMoreRef}
            type="open"
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

const Day = 1 * 60 * 60 * 24

const openOrderTableConfig: ITableConfig<IOpenOrder, { rwaTokens: IRwa[]; refetch: () => void }> = [
  {
    key: 'side',
    sortable: false,
    render: (item: IOpenOrder) => <SideCell side={item.side} />,
    width: 60,
  },
  {
    key: 'type',
    sortable: false,
    render: (item: IOpenOrder) => <OrderTypeCell orderType={item.orderType} />,
    width: 60,
  },
  {
    key: 'token',
    sortable: false,
    render: (item: IOpenOrder, { rwaTokens }: { rwaTokens: IRwa[] }) => {
      const rwa = rwaTokens.find(token => token.stockId === item.stockId)
      return <TokenCell icon={rwa?.icon} token={rwa?.symbol} name={rwa?.name} />
    },
  },
  {
    key: 'orderPrice',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOpenOrder) => <TextCell text={textPrefix(toFixed(item.price), '$')} />,
  },
  {
    key: 'orderAmount',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOpenOrder) => <AmountCell amount={item.size} />,
  },
  {
    key: 'filledAmount',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOpenOrder) => <AmountCell amount={item.settledSize} />,
  },
  {
    key: 'filledValue',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOpenOrder) => <ValueCell value={item.settledAmount} currency={item.currency} />,
  },
  {
    key: 'orderTime',
    sortable: false,
    render: (item: IOpenOrder) => (
      <TextCell className='w-[80px] text-sm/[17px]' text={formatTimestamp(item.txTime)} />
    ),
  },
  {
    key: 'expiration',
    sortable: false,
    render: (item: IOpenOrder) => {
      if (item.tif === 0) {
        return <TextCellWithTranslation text='assets.order.intraday' />
      }

      return <TextCell text={readableDuration(item.validDate * Day)} />
    },
  },
  {
    key: 'status',
    sortable: false,
    render: (item: IOpenOrder) => <OrderStatusCell state={item.state} />,
  },
  {
    key: 'action',
    sortable: false,
    render: (item: IOpenOrder, { refetch }) => (
      <CancelOrderButton refetch={refetch} orderId={item.orderId} disabled={item.state === 8} />
    ),
    width: 90,
  },
]

function CancelOrderButton(props: { orderId: string; refetch: () => void; disabled: boolean }) {
  const { disabled } = props
  const { t } = useTranslation()
  const { orderId } = props
  const { cancelOrder, txStep } = useTradeUtils()
  const setTxError = useTradeStore(state => state.setTxError)
  const setTxSuccess = useTradeStore(state => state.setTxSuccess)
  const [isCanceling, setIsCanceling] = useState(false)

  const { toastTxSteps, dismissTxToast } = useTxToast()
  const setTxStep = useTradeStore(state => state.setTxStep)
  const stepStartRef = useRef(false)

  useEffect(() => {
    if (stepStartRef.current) {
      setTxStep(txStep)
    }
  }, [txStep])
  const handleStartStep = useCallback(() => {
    stepStartRef.current = true
    dismissTxToast()
    setTxError('')
    setTxSuccess('', '', '')
    setTxStep(1)
  }, [setTxStep])
  // 结束后重置step和状态
  // type: 成功 or 失败
  const handleEndStep = useCallback(
    () => {
      dismissTxToast()
      setTxError('')
      setTxSuccess('', '', '')
      setTimeout(() => {
        stepStartRef.current = false
        setTxStep(1)
      }, 500)
    },
    [setTxStep]
  )

  const handleCancelOrder = async () => {
    try {
      setIsCanceling(true)
      handleStartStep()
      toastTxSteps({ action: 'cancel', approveed: true, onClick: handleEndStep })

      const res = await cancelOrder(orderId, { wait: true, skipSimulate: true })
      if (res.code === 9200) {
        
      } else {
        // @ts-ignore
        const errorMessage = res.data?.message
        setTxError(errorMessage ? t(`appErr.${errorMessage}`) : t('assets.order.cancelOrderFailed'))
      }
    } catch (error) {
      console.log('cancel order error', error)
    } finally {
      setIsCanceling(false)
    }
  }

  return (
    <button
      disabled={isCanceling || disabled}
      onClick={handleCancelOrder}
      className={cn(
        'cursor-pointer text-sm/5.5 font-medium text-[rgba(26,133,255,1)]',
        (isCanceling || disabled) && 'opacity-50 cursor-not-allowed'
      )}
    >
      {isCanceling ? t('assets.order.cancelOrdering') : t('assets.order.cancelOrder')}
    </button>
  )
}
