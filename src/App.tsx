import { BrowserRouter, useRoutes } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import routes from './routes'
import { ErrorBoundary } from './components/error/ErrorBoundary'
import { Suspense, useEffect, useRef } from 'react'
import storage from './utils/storage'
import { useTranslation } from './hooks/useTranslation'

import { Toaster } from "./components/ui/sonner";
import { useBaseStore } from "./stores/baseStore";
import { useTokenBalances } from "./hooks/useTokenBalances";
import { useActiveWeb3 } from "./hooks/useActiveWe3";
import { ScrollToTop } from "./components/ScrollToTop";
import { useWssOn } from './hooks/useWssOn'
import { Loading } from './components/loading'
import { useMarketState } from './hooks/useMarketState'
import { Menus } from './components/menu'
import { riskApi } from './service/risk/api'
import { useRiskStore } from './stores/riskStore'
import { useRiskUserConfig } from './hooks/useRiskStatus'
import { Updater } from './components/Updater'
import { ErrorChildren } from './components/error/ErrorChildren'
import { SuspenseLoading } from './components/loading/SuspenseLoading'

BigNumber.config({
  DECIMAL_PLACES: 80, // 足够精度，避免 DeFi 里丢失小数
  ROUNDING_MODE: BigNumber.ROUND_DOWN, // 通常用向下取整，避免超额
  EXPONENTIAL_AT: 1e9, // 禁止科学计数法
})

function RoutesWrapper() {
  return useRoutes(routes)
}

function App() {
  const { t, i18n } = useTranslation()
  const { account, chainId } = useActiveWeb3()
  const initBaseStore = useBaseStore(state => state.init)

  useEffect(() => {
    const lng = storage.getItem('CA_LANGUAGE') || 'en'
    i18n.changeLanguage(lng)
  }, [i18n])

  // 两个汇总到一起处理了
  // 获取余额信息
  useTokenBalances()
  // 获取Rwa余额
  // useRwaBalances()
  useMarketState()
  
  useRiskUserConfig()

  useEffect(() => {
    if (!chainId) return
    // 初始化baseStore
    initBaseStore(chainId)
  }, [chainId])

  

  const { wsService } = useWssOn()

  useEffect(() => {
    wsService.init({})
    return () => {
      wsService.close()
    }
  }, [])

  return (
    <ErrorBoundary fallback={<ErrorChildren />}>
      <Suspense fallback={<SuspenseLoading />}>
        <BrowserRouter>
          <ScrollToTop />
          <Menus />
          <Updater />
          <RoutesWrapper />
        </BrowserRouter>
        <Toaster position='top-center' />
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
