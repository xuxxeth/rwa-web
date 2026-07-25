import { useMemo } from 'react'

export type PageContentViewState =
  | 'booting'
  | 'disconnected'
  | 'switching'
  | 'loading'
  | 'empty'
  | 'ready'
  | 'hidden'

type UsePageContentStateParams = {
  active?: boolean
  requiresWallet?: boolean
  initialized: boolean
  isWalletConnecting?: boolean
  account?: string | null
  chainId?: number | null
  isSwitchingChain?: boolean
  isDataReady: boolean
  isLoading: boolean
  hasLoadedCurrentKey: boolean
  hasData: boolean
}

export function usePageContentState(params: UsePageContentStateParams) {
  const {
    active = true,
    requiresWallet = true,
    initialized,
    isWalletConnecting = false,
    account,
    chainId,
    isSwitchingChain = false,
    isDataReady,
    isLoading,
    hasLoadedCurrentKey,
    hasData,
  } = params

  const viewState: PageContentViewState = useMemo(() => {
    if (!active) return 'hidden'
    if (!initialized || isWalletConnecting) return 'booting'
    if (requiresWallet && !account) return 'disconnected'
    if (isSwitchingChain || !chainId) return 'switching'
    if (!isDataReady) return 'loading'
    if (isLoading || !hasLoadedCurrentKey) return 'loading'
    if (!hasData) return 'empty'
    return 'ready'
  }, [
    active,
    account,
    chainId,
    hasData,
    hasLoadedCurrentKey,
    initialized,
    isDataReady,
    isLoading,
    requiresWallet,
    isSwitchingChain,
    isWalletConnecting,
  ])

  return {
    viewState,
    shouldShowWalletNotConnected: viewState === 'disconnected',
    shouldShowLoading:
      viewState === 'booting' || viewState === 'switching' || viewState === 'loading',
    shouldShowEmpty: viewState === 'empty',
    shouldRenderContent: viewState === 'ready' || viewState === 'empty',
  }
}
