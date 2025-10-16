import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { OrderTabs } from "./OrderTabs"
import { useTranslation } from "@/hooks/useTranslation"
import { scanApi } from "@/service/scan/api"
import type { IOpenOrder } from "@/service/scan/types"
import { useTradeUtils } from "@/hooks/useCaCommon"
import { useToast } from "@/hooks/useToast"
import { OrderItem } from "./OrderItem"
import { Loading } from "../loading"
import { NoData } from "./NoData"
import Pagination from "../pagination"
import { RESPONSE_CODE } from "@/config/constants"



const OrderList = memo(
  ({ show, onClose }: { show: Boolean, onClose?: () => void}) => {
    const { t } = useTranslation()

    const [openOrderList, setOpenOrderList] = useState<IOpenOrder[]>([])
    const [after, setAfter] = useState('')
    const { cancelOrder } = useTradeUtils()
    const { toastSuccess, toastError } = useToast()
    const [isCanceling, setIsCanceling] = useState(false)
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [currentTab, setCurrentTab] = useState('open')
    const [currentOrderId, setCurrentOrderId] = useState('')
    const [nextDisabled, setNextDisabled] = useState(false)
    const afterList = useRef<string[]>([''])

    const getOpenOrders = useCallback(async (type: string, after?: string) => {
      // getOrderHistory
      setLoading(true)
      const action = type === 'open' ? scanApi.getOpenOrders : scanApi.getOrderHistory
      // @ts-ignore
      const res = await action({ after, noError: true })
      setLoading(false)
      console.log(res)
      if (!res) {

        return
      }
      if (res.code === RESPONSE_CODE.SUCCESS) {
        const _data = res.data || []
        if (_data.length < 10) {
          setNextDisabled(true)
        }
        setOpenOrderList(_data)
        if (_data.length >= 10) {
          setAfter(_data[_data.length - 1].orderId)
          afterList.current.push(_data[_data.length - 1].orderId)
          setNextDisabled(false)
        }
        return
      }
      // 未签名，则关闭弹窗，拉起签名
      if (res.code === RESPONSE_CODE.UNAUTHORIZED) {
        toastError({title: t('Unauthorized')})
        onClose && onClose()
        return
      }
    }, [])

    const filterOrderList = useMemo(() => {
      return openOrderList
    }, [openOrderList])

    useEffect(() => {
      if (show) {
        getOpenOrders('open')
      }
    }, [show])

    const handleCancelOrder = useCallback(async (orderId: number) => {
      try {
        setIsCanceling(true)
        // TODO: 需要在 ca-common-web 里修复
        const result = await cancelOrder(orderId, { wait: true })
        console.log(result)
        if (result && result?.code === -1) {
          toastError({title: typeof result?.message === 'string' ? result.message : result.message?.name || ''})
        } else {
          toastSuccess({
            title: t('assets.order.cancelOrderSuccess'),
          })
        }
        
      } catch (error) {
        console.log('===> cancel order error', error)
      } finally {
        setIsCanceling(false)
      }
    }, [])

    return (
      <div className="w-[510px]">
        <OrderTabs onChange={tab => {
          afterList.current = ['']
          setOpenOrderList([])
          setNextDisabled(false)
          setCurrentTab(tab.key)
          getOpenOrders(tab.key)
        }} />
        <div className=" min-h-[320px] max-h-[65vh] overflow-auto">
          {
            filterOrderList.map(order => {
              return (
                <OrderItem 
                  key={order.orderId} 
                  order={order} 
                  cancelOrder={handleCancelOrder}
                  type={currentTab}
                  expand={currentOrderId === order.orderId}
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
          
        </div>
        {
          filterOrderList.length > 0 &&
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