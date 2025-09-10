import { useAccount, useConnect, useDisconnect, useWallets } from "@/hooks/useCaCommon";

import { useCallback } from "react";
import type { DiscoveredWallet } from 'ca-common-web';

export function useWeb3Active() {
  const wallets = useWallets()
  const connect = useConnect();
  const disConnect = useDisconnect();
  const account = useAccount()

  const handleConnect = useCallback((type: string, wallet: DiscoveredWallet) => {
    connect(type as any, wallet)
  }, [])
  const handleDisConnect = useCallback(() => {
    disConnect()
  }, [])

  return {
    wallets,
    account,
    handleConnect,
    handleDisConnect,
  }
}