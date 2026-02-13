import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { SideType, TradeType } from "@/hooks/useCaCommon";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
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
    const { toastSuccess } = useToast()
    const { t } = useTranslation()
    const { account } = useActiveWeb3()
    const newOrder = useWssStore(state => state.newOrder)
    const setTxSuccess = useTradeStore(state => state.setTxSuccess)
    const freshTokenBalances = useBaseStore(state => state.freshTokenBalances)
    console.log(router.location)
    useEffect(() => {
      if (newOrder) {
        console.log('new order info: ', newOrder)
        const orderType = newOrder.y === 'LIMIT' ? t('limit') : t('market')
        // const orderSide = newOrder.S === 'BUY' ? t('Buy') : t('Sell')
        if (newOrder.x === 'NEW' || newOrder.x === 'CANCELLED') {
          let message = t('v2.tx.s', { orderType })
          if (newOrder.x === 'CANCELLED') {
            message = t('v2.tx.t11')
          }
          const toastId = getCurrentToastId()
          console.log('new order info', toastId, message)
          if (toastId) {
            setTxSuccess('success', message, newOrder.hx)
          } else {
            if (!NO_SHOW_PATH.includes(router.location.pathname)) {
              toastSuccess({ title: message, tx: newOrder.hx })
            }
          }
          
        }
        freshTokenBalances()
      }
    }, [newOrder, freshTokenBalances, t, router.location])

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