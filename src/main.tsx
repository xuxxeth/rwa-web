import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.tsx'
import { bscTestnet, WalletProvider, xLayerTestnet } from './hooks/useCaCommon.ts'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './queryClient.ts'

createRoot(document.getElementById('root')!).render(
  <WalletProvider
    config={{
      chains: [bscTestnet, xLayerTestnet],
      defaultChainId: bscTestnet.id,
    }}
  >
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <App />
      </StrictMode>
    </QueryClientProvider>
  </WalletProvider>
)
