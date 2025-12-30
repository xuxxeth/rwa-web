// stores/networkStore.ts
import { create } from 'zustand';
import type { PublicClient } from 'ca-common-web';

interface NetworkState {
  isOnline: boolean;
  lastCheckTime: Date | null;
  error: string | null;
  blockNumber: number | null;
  checkRpcNetwork: (publicClient: PublicClient | null) => Promise<void>;
  startNetworkMonitor: (publicClient: PublicClient | null, interval?: number) => () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isOnline: true,
  lastCheckTime: null,
  error: null,
  blockNumber: null,
  
  checkRpcNetwork: async (publicClient: PublicClient | null) => {
    try {
      // 使用 publicClient 获取区块号来检测网络状态
      const blockNumber = publicClient && await publicClient.getBlockNumber();
      set({ 
        isOnline: true,
        blockNumber: Number(blockNumber),
        lastCheckTime: new Date(),
        error: null
      });
    } catch (error) {
      set({ 
        isOnline: false,
        blockNumber: null,
        lastCheckTime: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.warn('RPC network check failed:', error);
    }
  },
  
  startNetworkMonitor: (publicClient: PublicClient | null, interval: number = 15000) => {
    const { checkRpcNetwork } = get();
    
    // 立即执行一次初始检查
    checkRpcNetwork(publicClient);
    
    // 定时检查
    const timer = setInterval(() => {
      checkRpcNetwork(publicClient);
    }, interval);
    
    // 返回清理函数
    return () => {
      clearInterval(timer);
    };
  }
}));