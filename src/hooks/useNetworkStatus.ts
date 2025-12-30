// hooks/useNetworkStatus.ts
import { useEffect, useMemo } from 'react';
import { useNetworkStore } from '../stores/networkStore';
import { useClient, type PublicClient } from 'ca-common-web';

export function useNetworkStatus(options?: {
  autoStart?: boolean;
  interval?: number;
}) {
  const {
    autoStart = true,
    interval = 30000
  } = options || {};
  
  const {
    isOnline,
    blockNumber,
    lastCheckTime,
    error,
    checkRpcNetwork,
    startNetworkMonitor
  } = useNetworkStore();

  const { publicClient } = useClient()
  const client = useMemo(() => (publicClient) as PublicClient, [publicClient])
  // 手动检查网络状态
  const manualCheck = () => {
    return checkRpcNetwork(client);
  };

  // 自动启动网络监控
  useEffect(() => {
    if (!autoStart) return;
    
    const cleanup = startNetworkMonitor(client, interval);
    
    return cleanup;
  }, [publicClient, autoStart, interval, startNetworkMonitor]);

  return {
    isOnline,
    blockNumber,
    lastCheckTime,
    error,
    checkNetwork: manualCheck,
    // 便捷的状态检查
    isChecking: !lastCheckTime,
    timeSinceLastCheck: lastCheckTime ? Date.now() - lastCheckTime.getTime() : null
  };
}