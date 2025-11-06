import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { memo } from "react";

const Updater = memo(
  () => {
    const { 
      isOnline, 
      blockNumber, 
      error 
    } = useNetworkStatus({
      interval: 15000 // 15秒检查一次
    });

    return null
  }
)

export { Updater }