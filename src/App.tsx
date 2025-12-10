import { useRoutes } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import routes from './routes'
import { useEffect, useMemo } from 'react'
import storage from './utils/storage'
import { useTranslation } from './hooks/useTranslation'

import { Toaster } from "./components/ui/sonner";
import { useBaseStore } from "./stores/baseStore";
import { useTokenBalances } from "./hooks/useTokenBalances";
import { useActiveWeb3 } from "./hooks/useActiveWe3";
import { ScrollToTop } from "./components/ScrollToTop";
import { useWssAuth, useWssOn } from './hooks/useWssOn'
import { useMarketState } from './hooks/useMarketState'
import { Menus } from './components/menu'
import { useRiskUserConfig } from './hooks/useRiskStatus'
import { Updater } from './components/Updater'
import { useRouter } from './hooks/useRouter'
import { HomeMenus } from './components/menu/HomeMenus'
import { kycApi } from './service/kyc/api'
import { riskApi } from './service/risk/api'

BigNumber.config({
  DECIMAL_PLACES: 80, // 足够精度，避免 DeFi 里丢失小数
  ROUNDING_MODE: BigNumber.ROUND_DOWN, // 通常用向下取整，避免超额
  EXPONENTIAL_AT: 1e9, // 禁止科学计数法
})

export function RoutesWrapper() {
  return useRoutes(routes)
}

const HOME_MENUS_PATH = ['/']

function App() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { account, chainId } = useActiveWeb3()
  const initBaseStore = useBaseStore(state => state.init)
  const isHomeMenus = useMemo(() => HOME_MENUS_PATH.includes(router.location.pathname), [router.location.pathname])

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

  useWssAuth()

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
    <>
      <ScrollToTop />
      {
        isHomeMenus ? <HomeMenus /> : <Menus />
      }
      <RoutesWrapper />
      <Toaster position='top-center' />
      <Updater />

    </>
  )
}

export default App
