import { useAccount, useChainId, useConnect, useDisconnect, useWallets } from '@/hooks/useCaCommon'

import { useCallback } from 'react'
import type { ConnectorType, WalletConfig } from '@/hooks/useCaCommon'
import storage from '@/utils/storage'
import { CONNECTOR_TYPE, LATEST_WALLET_UUID, WALLET_UUID } from '@/config/constants'

export function useActiveWeb3() {
  const wallets = useWallets()
  const connect = useConnect()
  const disConnect = useDisconnect()
  const account = useAccount() as unknown as string | undefined
  const chainId = useChainId()

  const handleConnect = useCallback(
    async (connectorType: ConnectorType, wallet: WalletConfig) => {
      storage.setItem(CONNECTOR_TYPE, connectorType)
      storage.setItem(WALLET_UUID, wallet.info.name)
      storage.setItem(LATEST_WALLET_UUID, wallet.info.name)
      await connect(connectorType, wallet)
    },
    [connect]
  )

  const handleDisConnect = useCallback(async () => {
    storage.removeItem(WALLET_UUID)
    storage.removeItem(CONNECTOR_TYPE)
    await disConnect()
  }, [disConnect])

  return {
    wallets,
    account,
    chainId,
    handleConnect,
    handleDisConnect,
  }
}
