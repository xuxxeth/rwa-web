import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useBaseStore } from "@/stores/baseStore";
import { useWssStore } from "@/stores/wssStore";
import { memo, useEffect } from "react";

const Updater = memo(
  () => {
    const { 
      isOnline, 
      blockNumber, 
      error 
    } = useNetworkStatus({
      interval: 15000 // 15秒检查一次
    });

    const newOrder = useWssStore(state => state.newOrder)
    const freshTokenBalances = useBaseStore(state => state.freshTokenBalances)
    useEffect(() => {
      if (newOrder) {
        console.log('new order info: ', newOrder)
        freshTokenBalances()
      }
    }, [newOrder, freshTokenBalances])

    return null
  }
)

export { Updater }