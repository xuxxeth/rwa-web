import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { OrderTabs } from './OrderTabs'
import { useTranslation } from '@/hooks/useTranslation'
import { scanApi } from '@/service/scan/api'
import type { IOpenOrder } from '@/service/scan/types'
import { useToast } from '@/hooks/useToast'
import { OrderItem } from './OrderItem'
import { Loading } from '../loading'
import { NoData } from './NoData'
import Pagination from '../pagination'
import { RESPONSE_CODE } from '@/config/constants'
import { ScrollBox } from '../scroll-box'
import { useTradeUtils } from '@/hooks/useTrading'
import { useWssStore } from '@/stores/wssStore'
import { type OrderChanged, checkOrderChangedEqual } from '@/views/assets/Shared'
import { useTxToast } from '@/hooks/useTxToast'
import { useTradeStore } from '@/stores/tradeStore'

const limit = 3

// 监听 orderChanged 变化，刷新订单列表，把刷新的方法传递进去
function useOrderChanged(refresh: () => void) {
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

  useEffect(() => {
    if (!orderChanged) return
    refresh()
  }, [orderChanged])
}

const OrderList = memo(({ show, onClose }: { show: Boolean; onClose?: () => void }) => {
  const { t } = useTranslation()

  const [openOrderList, setOpenOrderList] = useState<IOpenOrder[]>([])
  const [after, setAfter] = useState('')
  const { cancelOrder, txStep } = useTradeUtils()
  const { toastSuccess, toastError } = useToast()
  const setTxError = useTradeStore(state => state.setTxError)
  const setTxSuccess = useTradeStore(state => state.setTxSuccess)
  const [isCanceling, setIsCanceling] = useState(false)
  const [cancelOrderId, setCancelOrderId] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentTab, setCurrentTab] = useState('open')
  const [currentOrderId, setCurrentOrderId] = useState('')
  const [nextDisabled, setNextDisabled] = useState(false)
  const afterList = useRef<string[]>([''])
  const preTab = useRef<string>('open')

  const loadingLock = useRef(false)
  const getOpenOrders = useCallback(
    async (_type?: string, _after?: string, from?: string) => {
      try {
        if (loadingLock.current) return
        loadingLock.current = true

        // getOrderHistory
        setLoading(true)
        const actionType = _type
        const afterId = _after || undefined
        const action = actionType === 'open' ? scanApi.getOpenOrders : scanApi.getOrderHistory
        // @ts-ignore
        const res = await action({ after: afterId, noError: true, limit: limit })

        setLoading(false)
        if (!res) {
          return
        }
        if (preTab.current !== currentTab && from === 'interval') {
          preTab.current = currentTab
          return
        }
        if (res.code === RESPONSE_CODE.SUCCESS) {
          const _data = res.data || []
          if (_data.length < limit) {
            setNextDisabled(true)
          }
          setOpenOrderList(_data)
          if (_data.length >= limit) {
            setAfter(_data[_data.length - 1].orderId)
            afterList.current.push(_data[_data.length - 1].orderId)
            setNextDisabled(false)
          }
          return
        }
      } finally {
        loadingLock.current = false
      }
    },
    [currentTab]
  )

  // orderChanged 之后的刷新
  const refresh = () => {
    if (currentPage === 1) {
      getOpenOrders(currentTab)
    } else {
      let _afterId = afterList.current[currentPage - 2]
      getOpenOrders(currentTab, _afterId)
    }
  }

  // 监听 orderChanged 变化，刷新订单列表，把刷新的方法传递进去
  useOrderChanged(refresh)

  const filterOrderList = useMemo(() => {
    return openOrderList
  }, [openOrderList])

  useEffect(() => {
    if (show) {
      getOpenOrders('open')
    }
  }, [show])

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

  const handleCancelOrder = useCallback(
    async (orderId: string) => {
      try {
        if (isCanceling) return
        setIsCanceling(true)
        setCancelOrderId(String(orderId))
        handleStartStep()
        toastTxSteps({action: 'cancel', approveed: true, onClick: handleEndStep})
        
        const result = await cancelOrder(orderId, { wait: true, skipSimulate: true })
        if (result && result?.code !== 9200) {
          
          // @ts-ignore
          const errorMessage = result.data?.message
          setTxError(errorMessage ? t(`appErr.${errorMessage}`) : t('assets.order.cancelOrderFailed'))

        } else {
          
          // 本地更新订单状态
          const _orderIndex = openOrderList.findIndex(order => order.orderId === orderId)
          if (_orderIndex > -1) {
            openOrderList[_orderIndex].state = 8
          }
          setOpenOrderList([...openOrderList])
          
        }
      } catch (error) {
        console.log('cancel order error', error)
      } finally {
        setIsCanceling(false)
      }
    },
    [t, isCanceling, openOrderList, handleStartStep, handleEndStep, cancelOrder, toastError]
  )

  // 注释掉 polling 操作了
  // const pollingRef = useRef<NodeJS.Timeout | null>(null)
  // useEffect(() => {
  //   if (pollingRef.current) {
  //     clearInterval(pollingRef.current)
  //     pollingRef.current = null
  //   }
  //   if (!pollingRef.current) {
  //     pollingRef.current = setInterval(() => {
  //       if (currentPage > 0) {
  //         const _page = currentPage
  //         let _afterId = afterList.current[_page - 1]
  //         getOpenOrders(currentTab, _afterId, 'interval')
  //       } else {
  //         getOpenOrders(currentTab, undefined, 'interval')
  //       }
  //     }, 10000)
  //   }

  //   return () => {
  //     if (pollingRef.current) {
  //       clearInterval(pollingRef.current)
  //       pollingRef.current = null
  //     }
  //   }
  // }, [getOpenOrders, currentTab, currentPage, afterList])

  return (
    <div className='w-[510px]'>
      <OrderTabs
        disabled={loading}
        onChange={tab => {
          afterList.current = ['']
          setAfter('')
          setOpenOrderList([])
          setNextDisabled(false)
          preTab.current = tab.key
          setCurrentTab(tab.key)
          getOpenOrders(tab.key)
        }}
      />
      <ScrollBox p={24} top={0} className='min-h-[320px] max-h-[80vh] h-auto'>
        {filterOrderList.map(order => {
          return (
            <OrderItem
              key={order.orderId}
              order={order}
              cancelOrder={handleCancelOrder}
              type={currentTab}
              expand={currentOrderId === order.orderId}
              canceling={isCanceling && cancelOrderId === order.orderId}
              onExpand={orderId => {
                setCurrentOrderId(orderId)
              }}
            />
          )
        })}
        {loading && filterOrderList.length <= 0 && (
          <div className='py-[100px]'>
            <Loading />
          </div>
        )}
        {!loading && filterOrderList.length <= 0 && (
          <div className='py-[100px]'>
            <NoData />
          </div>
        )}
      </ScrollBox>
      {(filterOrderList.length >= limit || after) && (
        <Pagination
          className='mt-1'
          currentPage={currentPage}
          nextDisabled={nextDisabled}
          onPrevClick={() => {
            if (currentPage > 0) {
              const _page = currentPage - 1
              setCurrentPage(_page)
              let _afterId = afterList.current[_page - 1]
              afterList.current.splice(_page)
              getOpenOrders(currentTab, _afterId)
            }
          }}
          onNextClick={() => {
            if (loading || nextDisabled) return
            setCurrentPage(currentPage + 1)
            const _afterId = afterList.current[afterList.current.length - 1]
            getOpenOrders(currentTab, _afterId)
          }}
        />
      )}
    </div>
  )
})

export { OrderList }
