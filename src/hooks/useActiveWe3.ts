import { useAccount, useChainId, useConnect, useDisconnect, useWallets } from "@/hooks/useCaCommon";

import { useCallback } from "react";
import type { ConnectorType, DiscoveredWallet } from '@/hooks/useCaCommon';
import storage from "@/utils/storage";
import { CONNECTOR_TYPE, WALLET_UUID } from "@/config/constants";

export function useActiveWeb3() {
  const wallets = useWallets()
  const connect = useConnect();
  const disConnect = useDisconnect();
  const account = useAccount()
  const chainId = useChainId()

  const handleConnect = useCallback((type: string, wallet: DiscoveredWallet) => {
    storage.setItem(CONNECTOR_TYPE, type)
    storage.setItem(WALLET_UUID, wallet.info.name)
    connect(type as ConnectorType, wallet)
  }, [])
  const handleDisConnect = useCallback(() => {
    storage.removeItem(WALLET_UUID)
    storage.removeItem(CONNECTOR_TYPE)
    disConnect()
  }, [])

  return {
    wallets,
    account,
    chainId,
    handleConnect,
    handleDisConnect,
  }
}