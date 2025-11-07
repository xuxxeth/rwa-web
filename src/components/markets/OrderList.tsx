import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { OrderTabs } from "./OrderTabs"
import { useTranslation } from "@/hooks/useTranslation"
import { scanApi } from "@/service/scan/api"
import type { IOpenOrder } from "@/service/scan/types"
import { useToast } from "@/hooks/useToast"
import { OrderItem } from "./OrderItem"
import { Loading } from "../loading"
import { NoData } from "./NoData"
import Pagination from "../pagination"
import { RESPONSE_CODE } from "@/config/constants"
import { ScrollBox } from "../scroll-box"
import { useTradeUtils } from "@/hooks/useTrading"

const limit = 4

const OrderList = memo(
  ({ show, onClose }: { show: Boolean, onClose?: () => void}) => {
    const { t } = useTranslation()

    const [openOrderList, setOpenOrderList] = useState<IOpenOrder[]>([])
    const [after, setAfter] = useState('')
    const { cancelOrder } = useTradeUtils()
    const { toastSuccess, toastError } = useToast()
    const [isCanceling, setIsCanceling] = useState(false)
    const [cancelOrderId, setCancelOrderId] = useState('')
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [currentTab, setCurrentTab] = useState('open')
    const [currentOrderId, setCurrentOrderId] = useState('')
    const [nextDisabled, setNextDisabled] = useState(false)
    const afterList = useRef<string[]>([''])
    const preTab = useRef<string>('open')

    const getOpenOrders = useCallback(async (_type?: string, _after?: string, from?: string) => {
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
    }, [currentTab])

    const filterOrderList = useMemo(() => {
      return openOrderList
    }, [openOrderList])

    useEffect(() => {
      if (show) {
        getOpenOrders('open')
      }
    }, [show])

    const handleCancelOrder = useCallback(async (orderId: string) => {
      try {
        if (isCanceling) return
        setIsCanceling(true)
        setCancelOrderId(String(orderId))
        // TODO: 需要在 ca-common-web 里修复
        // @ts-ignore
        const result = await cancelOrder(orderId, { wait: true })
        if (result && result?.code !== 9200) {
          // @ts-ignore
          const errorMessage = result.data?.message
          if (errorMessage) {
            toastError({
              title: t(`appErr.${errorMessage}`),
            })
          } else {
            toastError({
              title: t('assets.order.cancelOrderFailed'),
            })
          }
          
        } else {
          // 本地更新订单状态
          const _orderIndex = openOrderList.findIndex(order => order.orderId === orderId)
          if (_orderIndex > -1) {
            openOrderList[_orderIndex].state = 8
          }
          setOpenOrderList([...openOrderList])
          toastSuccess({
            title: t('assets.order.cancelOrderSuccess'),
          })
        }
        
      } catch (error) {
        console.log('cancel order error', error)
      } finally {
        setIsCanceling(false)
      }
    }, [t, isCanceling, openOrderList])

    const pollingRef = useRef<NodeJS.Timeout | null>(null)
    useEffect(() => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      if (!pollingRef.current) {
        pollingRef.current = setInterval(() => {
          if (currentPage > 0) {
            const _page = currentPage
            let _afterId = afterList.current[_page - 1]
            getOpenOrders(currentTab, _afterId, 'interval')
          } else {
            getOpenOrders(currentTab, undefined, 'interval')
          }
        }, 10000)
      }

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
      }
    }, [getOpenOrders, currentTab, currentPage, afterList])


    return (
      <div className="w-[510px]">
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
        }} />
        <ScrollBox p={24} top={0} className="min-h-[320px] max-h-[65vh] h-auto">
        
          {
            filterOrderList.map(order => {
              return (
                <OrderItem 
                  key={order.orderId} 
                  order={order} 
                  cancelOrder={handleCancelOrder}
                  type={currentTab}
                  expand={currentOrderId === order.orderId}
                  canceling={isCanceling && (cancelOrderId === order.orderId)}
                  onExpand={orderId => {
                    setCurrentOrderId(orderId)
                  }}
                />
              )
            })
          }
          {
            loading && filterOrderList.length <= 0 && <div className="py-[100px]"><Loading /></div>
          }
          {
            !loading && filterOrderList.length <= 0 && <div className="py-[100px]"><NoData /></div>
          }
        </ScrollBox> 
        {
          (filterOrderList.length >= limit || after) &&
            <Pagination
              className="mt-1"
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
        }
        
      </div>
    )
  }
)

export { OrderList }