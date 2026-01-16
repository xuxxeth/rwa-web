import { useAccount, useChainId, useConnect, useDisconnect, useWallets, useInitialized } from '@/hooks/useCaCommon'

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
  const initialized = useInitialized()

  const handleConnect = useCallback(
    async (connectorType: ConnectorType, wallet: WalletConfig) => {
      try {
        await connect(connectorType, wallet)
        // 这里应该是连接成功之后，才存储状态
        storage.setItem(CONNECTOR_TYPE, connectorType)
        storage.setItem(WALLET_UUID, wallet.info.name)
        storage.setItem(LATEST_WALLET_UUID, wallet.info.name)
      } catch (error) {
        storage.removeItem(WALLET_UUID)
        storage.removeItem(CONNECTOR_TYPE)
        storage.removeItem(LATEST_WALLET_UUID)
        throw error
      }
    },
    [connect]
  )

  const handleDisConnect = useCallback(async () => {
    console.log('wallet debugger1: web exec handleDisConnect')
    storage.removeItem(WALLET_UUID)
    storage.removeItem(CONNECTOR_TYPE)
    await disConnect()
  }, [disConnect])

  return {
    initialized,
    wallets,
    account,
    chainId,
    handleConnect,
    handleDisConnect,
  }
}
