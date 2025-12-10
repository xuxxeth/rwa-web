import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.tsx'
import { bscTestnet, WalletProvider, xLayerTestnet } from './hooks/useCaCommon.ts'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './queryClient.ts'
import { ErrorBoundary } from './components/error/ErrorBoundary.tsx'
import { ErrorChildren } from './components/error/ErrorChildren.tsx'
import { SuspenseLoading } from './components/loading/SuspenseLoading.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <WalletProvider
    config={{
      chains: [bscTestnet, xLayerTestnet],
      defaultChainId: bscTestnet.id,
    }}
  >
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <ErrorBoundary fallback={<ErrorChildren />}>
          <Suspense fallback={<SuspenseLoading />}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </Suspense>
        </ErrorBoundary>
      </StrictMode>
    </QueryClientProvider>
  </WalletProvider>
)
