import { StrictMode, Suspense, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.tsx'
import { bscTestnet, WalletProvider, xLayerTestnet, defaultChains } from './hooks/useCaCommon.ts'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './queryClient.ts'
import { ErrorBoundary } from './components/error/ErrorBoundary.tsx'
import { ErrorChildren } from './components/error/ErrorChildren.tsx'
import { SuspenseLoading } from './components/loading/SuspenseLoading.tsx'
import { BrowserRouter } from 'react-router-dom'
import { useBaseStore } from './stores/baseStore.ts'
import { LAST_CONNECTED_CHAIN_ID } from '@/config/storage'
import storage from '@/utils/storage'

const CHAIN_CONFIG = [...defaultChains, bscTestnet, xLayerTestnet]

function Root() {
  const chainList = useBaseStore(state => state.chainList)
  const chains = useMemo(() => {
    if (!chainList || chainList.length === 0) return []
    // 按 chainList 的顺序查找
    return chainList
      .map(chain => {
        const _chain = CHAIN_CONFIG.find(configChain => configChain.id === chain.id)
        if (_chain) {
          return {
            ..._chain,
            name: chain.displayName,
            rpcUrls: {
              ..._chain.rpcUrls,
              public: { http: [..._chain.rpcUrls.public.http, chain.rpc] },
            },
            blockExplorers: {
              default: { name: chain.displayName, url: chain.scan },
            },
          }
        }
      })
      .filter(chain => chain !== undefined)
  }, [chainList])

  const defaultChainId = useMemo(() => {
    const lastConnectedChainId = storage.getItem(LAST_CONNECTED_CHAIN_ID)
    return lastConnectedChainId ? parseInt(lastConnectedChainId) : chains[0]?.id
  }, [chains])

  return (
    <WalletProvider
      config={{
        chains: chains,
        defaultChainId: defaultChainId,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </WalletProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<ErrorChildren />}>
      <Suspense fallback={<SuspenseLoading />}>
        <Root />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
)
