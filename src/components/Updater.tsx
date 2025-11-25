import { useNetworkStatus } from "@/hooks/useNetworkStatus";
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

    useEffect(() => {
      if (newOrder) {
        console.log('new order info: ', newOrder)
      }
    }, [newOrder])

    return null
  }
)

export { Updater }