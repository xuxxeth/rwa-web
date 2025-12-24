import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useWssOn } from "@/hooks/useWssOn";
import { useBaseStore } from "@/stores/baseStore";
import { useWssStore } from "@/stores/wssStore";
import storage from "@/utils/storage";
import { KYC_UPLOAD_STORAGE_KEY } from "@/views/identity/components/Upload/shared";
import { lazy, memo, useEffect, useRef } from "react";
const KycState = lazy(() => import("@/components/kyc-state"));
const Compliance = lazy(() => import("@/components/compliance"));

const Updater = memo(
  () => {
    // const { 
    //   isOnline, 
    //   blockNumber, 
    //   error 
    // } = useNetworkStatus({
    //   interval: 15000 // 15秒检查一次
    // });
    const { account } = useActiveWeb3()
    const newOrder = useWssStore(state => state.newOrder)
    const freshTokenBalances = useBaseStore(state => state.freshTokenBalances)
    useEffect(() => {
      if (newOrder) {
        console.log('new order info: ', newOrder)
        freshTokenBalances()
      }
    }, [newOrder, freshTokenBalances])


    const setTokenWithPriceByWebSocketData = useBaseStore(
        state => state.setTokenWithPriceByWebSocketData
      )
    const setStockWithPriceByWebSocketData = useBaseStore(
      (state) => state.setStockWithPriceByWebSocketData
    );
    const stableTokenWithPrice = useWssStore(state => state.setStableTokenWithPrice)
    
    useWssOn('summary', (data: any) => {
      setTokenWithPriceByWebSocketData(data || [])
      setStockWithPriceByWebSocketData(data || [])
      stableTokenWithPrice(data || [])
    })


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