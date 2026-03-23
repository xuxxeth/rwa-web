import {
  SideCell,
  TokenCell,
  OrderStatusCell,
  ValueCell,
  AmountCell,
  TextCell,
  OrderTypeCell,
  DropDownFilter,
  TokenFilterItem,
  TextCellWithTranslation,
  TxHashCell,
  SessionTypeCell,
} from '../Shared'
import { type IRwa } from '@/service/base/types'
import { useRwaTokens } from '@/hooks/useTokens'
import {
  useOrderFilterStore,
  generateOpenOrderFilterObj,
  type IOpenOrderFilter,
} from '@/stores/orderFilterStore'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { scanApi } from '@/service/scan/api'
import { TableHeader, type ITableConfig } from '@/components/table-header'
import { type IOpenOrder } from '@/service/scan/types'
import {
  cn,
  textPrefix,
  toFixed,
  formatTimestamp,
  noop,
  readableDuration,
  divide,
  truncate,
} from '@/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { useTxToast } from '@/hooks/useTxToast'
import { useTradeStore } from '@/stores/tradeStore'
import { useTradeUtils } from '@/hooks/useTrading'
import { useToast } from '@/hooks/useToast'
import { OrderTable } from './shared'
import useDebounce from '@/hooks/useDebounce'

const PAGE_LIMIT = 20

function OpenOrder(props: {
  chainId?: number | null
  account?: string
  showFilter?: boolean
  dataMode: 'pagination' | 'scroll'
  allowUserFilter: boolean
}) {
  const rwaTokens = useRwaTokens()
  const { chainId, account, showFilter, dataMode, allowUserFilter } = props

  const openOrderFilters = useOrderFilterStore(state => state.openOrderFilters)
  const updateOpenOrderFilters = useOrderFilterStore(state => state.updateOpenOrderFilters)

  const filter = useMemo(() => {
    if (!allowUserFilter) {
      return { limit: PAGE_LIMIT }
    }
    const userSelectFilter = generateOpenOrderFilterObj(openOrderFilters)

    return { limit: PAGE_LIMIT, ...userSelectFilter }
  }, [openOrderFilters, allowUserFilter])

  return (
    <>
      {showFilter && (
        <div className='flex flex-row gap-4.5 px-4 mb-3'>
          <DropDownFilter
            data={openOrderFilters.orderType}
            onDataChange={(reduce: (prev: string[]) => string[]) =>
              updateOpenOrderFilters({
                orderType: reduce(openOrderFilters.orderType),
              })
            }
            items={[
              { key: 'limit', value: '0' },
              { key: 'market', value: '1' },
            ]}
            title={'orderType'}
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
          <DropDownFilter
            data={openOrderFilters.stockIds}
            onDataChange={(reduce: (prev: string[]) => string[]) =>
              updateOpenOrderFilters({
                stockIds: reduce(openOrderFilters.stockIds),
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
        </div>
      )}
      <OrderTable<IOpenOrder, IOpenOrderFilter>
        chainId={chainId}
        account={account}
        PAGE_LIMIT={PAGE_LIMIT}
        dataMode={dataMode}
        api={scanApi.getOpenOrders}
        scrollId={(item: IOpenOrder) => item.orderId}
        filter={filter}
        tableConfig={openOrderTableConfig}
        type={'open'}
      />
    </>
  )
}

const Day = 1 * 60 * 60 * 24

const openOrderTableConfig: ITableConfig<
  IOpenOrder,
  { rwaTokens: IRwa[]; refetch: () => void; onTokenClick?: (rwa: IRwa) => void }
> = [
  {
    key: 'side',
    sortable: false,
    render: (item: IOpenOrder) => <SideCell side={item.side} className='text-xs/4' />,
    width: 60,
  },
  {
    key: 'type',
    sortable: false,
    render: (item: IOpenOrder) => (
      <OrderTypeCell orderType={item.orderType} className='text-xs/4' />
    ),
    width: 60,
  },
  {
    key: 'token',
    sortable: false,
    render: (
      item: IOpenOrder,
      { rwaTokens, onTokenClick }: { rwaTokens: IRwa[]; onTokenClick?: (rwa: IRwa) => void }
    ) => {
      const rwa = rwaTokens.find(token => token.stockId === item.stockId)
      return (
        <TokenCell
          tokenClassName='text-xs/4'
          nameClassName='text-gray-400 text-xs/[15px]'
          token={rwa?.symbol}
          name={rwa?.name}
          onClick={() => {
            onTokenClick?.(rwa!)
          }}
        />
      )
    },
  },
  {
    key: 'orderPrice',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOpenOrder) => {
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
    render: (item: IOpenOrder) => (
      <div className='flex flex-row items-center'>
        <AmountCell amount={item.settledSize} />
        <span className='text-sm'>/</span>
        <AmountCell amount={item.size} />
      </div>
    ),
  },
  {
    key: 'filledValue',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOpenOrder) => (
      <ValueCell value={toFixed(item.settledAmount)} currency={item.currency} />
    ),
  },
  {
    key: 'filledAvg',
    sortable: false,
    breakOnSpace: false,
    render: (item: IOpenOrder) => (
      <TextCell text={textPrefix(toFixed(divide(item.settledAmount, item.settledSize)), '$')} />
    ),
  },
  {
    key: 'orderTime',
    sortable: false,
    render: (item: IOpenOrder) => (
      <TextCell className='w-[80px] text-xs/4' text={formatTimestamp(item.txTime)} />
    ),
  },
  {
    key: 'expiration',
    sortable: false,
    render: (item: IOpenOrder) => {
      if (item.orderType === 1) {
        return '--'
      }
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
    key: 'session',
    sortable: false,
    render: (item: IOpenOrder) => <SessionTypeCell sessionType={item.sessionType} />,
  },
  {
    key: 'txHash',
    sortable: false,
    width: 125,
    render: (item: IOpenOrder) => <TxHashCell hash={item.txHash} />,
  },
  {
    key: 'action',
    sortable: false,
    render: (item: IOpenOrder, { refetch }) => {
      if (item.orderType === 1) {
        return '--'
      }
      return (
        <CancelOrderButton
          refetch={refetch}
          className='max-w-[50px] text-ellipsis overflow-hidden'
          orderId={item.orderId}
          disabled={item.state === 8}
        />
      )
    },
    width: 65,
  },
]

function CancelOrderButton(props: {
  className?: string
  orderId: string
  refetch: () => void
  disabled: boolean
}) {
  const { className, disabled } = props
  const { t } = useTranslation()
  const { orderId } = props
  const { cancelOrder, txStep } = useTradeUtils()
  const { toastSuccess, toastError } = useToast()
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
  const handleEndStep = useCallback(() => {
    dismissTxToast()
    setTxError('')
    setTxSuccess('', '', '')
    setTimeout(() => {
      stepStartRef.current = false
      setTxStep(1)
    }, 500)
  }, [setTxStep])

  const [isOnCooldown, setIsOnCooldown] = useState(false)
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current)
      }
    }
  }, [])

  const handleCancelOrder = async () => {
    if (isCanceling || isOnCooldown) return

    try {
      setIsCanceling(true)
      handleStartStep()
      toastTxSteps({ action: 'cancel', approveed: true, onClick: handleEndStep })

      const res = await cancelOrder(orderId, { wait: true, skipSimulate: true })
      if (res.code === 9200) {
        setIsOnCooldown(true)
        cooldownTimerRef.current = setTimeout(() => {
          setIsOnCooldown(false)
        }, 10 * 1000)
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

  const debouncedCancelOrder = useDebounce(handleCancelOrder, 500)

  return (
    <button
      disabled={isCanceling || disabled || isOnCooldown}
      onClick={debouncedCancelOrder}
      className={cn(
        'cursor-pointer text-xs/4 text-left font-normal rounded-[4px] group-hover:text-green-100 group-hover:bg-[rgba(37,167,80,0.2)] px-1 py-[2px]',
        className,
        (isCanceling || disabled || isOnCooldown) &&
          'opacity-50 cursor-not-allowed pointer-events-none'
      )}
    >
      {isCanceling ? t('assets.order.cancelOrdering') : t('assets.order.cancelOrder')}
    </button>
  )
}

export default OpenOrder
