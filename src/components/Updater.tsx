import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { useRouter } from "@/hooks/useRouter";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/hooks/useTranslation";
import { getCurrentToastId } from "@/hooks/useTxToast";
import { useBaseStore } from "@/stores/baseStore";
import { useTradeStore } from "@/stores/tradeStore";
import { useWssStore } from "@/stores/wssStore";
import storage from "@/utils/storage";
import { KYC_UPLOAD_STORAGE_KEY } from "@/views/identity/components/Upload/shared";
import { lazy, memo, useEffect, useRef } from "react";
const KycState = lazy(() => import("@/components/kyc-state"));
const Compliance = lazy(() => import("@/components/compliance"));

const NO_SHOW_PATH = ['/']

const Updater = memo(
  () => {
    // const { 
    //   isOnline, 
    //   blockNumber, 
    //   error 
    // } = useNetworkStatus({
    //   interval: 15000 // 15秒检查一次
    // });
    const router = useRouter()
    const { toastSuccess, toastError } = useToast()
    const { t } = useTranslation()
    const { account } = useActiveWeb3()
    const newOrder = useWssStore(state => state.newOrder)
    const setTxSuccess = useTradeStore(state => state.setTxSuccess)
    const freshTokenBalances = useBaseStore(state => state.freshTokenBalances)
    const lastHandledOrderKeyRef = useRef("")

    useEffect(() => {
      if (!newOrder || (newOrder.x !== "NEW" && newOrder.x !== "CANCELLED" && newOrder.x !== "FILLED" && newOrder.x !== "PARTIALLY_FILLED")) {
        return
      }

      const orderKey = `${newOrder.id}-${newOrder.x}`
      if (orderKey === lastHandledOrderKeyRef.current) {
        return
      }
      lastHandledOrderKeyRef.current = orderKey

      console.log("new order info: ", newOrder)
      const isMarket = newOrder.y === "MARKET"
      const orderType = !isMarket ? t("limit") : t("market")
      const orderSide = newOrder.S === "BUY" ? t("Buy") : t("Sell")
      let message = ''
      let isFailed = false
      if (newOrder.x === "NEW") {
        message = t("v2.tx.s", { orderType, orderSide })
      }
      if (newOrder.x === 'FILLED' || newOrder.x === 'PARTIALLY_FILLED') {
        message = t("v2.tx.fs", { orderType, orderSide, filled: newOrder.s, token: newOrder.sl })
      }
      // if (newOrder.x === 'PARTIALLY_FILLED') {
      //   message = t("v2.tx.fs", { orderType, filled: newOrder.s, size: newOrder.s, token: newOrder.sl })
      // }
      // 撤单状态，包括FAILED和CANCELLED两种，前者是撤单失败，后者是撤单成功
      // 在假市价单场景下，不提示撤单信息，只提示委托失败，因为假市价单的撤单是自动撤单，用户并没有主动撤单，所以不提示撤单成功或者失败的信息
      if (newOrder.x === "CANCELLED") {
        if (isMarket) {
          message = t("v2.tx.t125")
          // CANCELLED状态
          if (newOrder.r === 0 || newOrder.r === 1 || newOrder.r === 2) { 
            // 假市价单正常撤单，则提示價格波動過大，超出滑點範圍。請提高滑點後重試。
            if (newOrder.r === 0 || newOrder.r === 1) {
              message = t("v2.tx.t121")
            }
            // 收市撤单则提示订单到期已关闭
            if (newOrder.r === 2) {
              message = t("v2.tx.t122")
            }
          }
          // FAILED状态
          if (newOrder.r === 3 || newOrder.r === 4 || newOrder.r === 5 || newOrder.r === 6 || newOrder.r === 7) {
            isFailed = true
            if (newOrder.r === 3 || newOrder.r === 4) {
              message = t("v2.tx.t123")
            }
            if (newOrder.r === 5) {
              message = t("v2.tx.t124")
            }
            if (newOrder.r === 6 || newOrder.r === 7) {
              message = t("v2.tx.t125")
            }
          }
          
        } else {
          message = t("v2.tx.t11")
        }
        
      }
      const toastId = getCurrentToastId()
      console.log("new order info", toastId, message)
      if (toastId && newOrder.x !== "CANCELLED") {
        setTxSuccess("success", message, newOrder.hx)
      } else if (!NO_SHOW_PATH.includes(router.location.pathname)) {
        if (isFailed) {
          toastError({ title: message, tx: newOrder.hx })
        } else {
          toastSuccess({ title: message, tx: newOrder.hx })
        }
        
      }
      freshTokenBalances()
    }, [newOrder, freshTokenBalances, t, router.location.pathname, setTxSuccess, toastSuccess])

    const preAccount = useRef<string | undefined>(undefined)
    useEffect(() => {
      if (account && preAccount.current && account !== preAccount.current) {
        storage.removeItem(KYC_UPLOAD_STORAGE_KEY)
        storage.removeItem('kycBaseInfo')
      }
      preAccount.current = account
    }, [account])

    return (
      <>
        <KycState />
        <Compliance />
      </>
    )
  }
)

export { Updater }
