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
import GoogleAnalytics from '@/components/google-analytics/GoogleAnalytics'
import { createPortal } from 'react-dom'

BigNumber.config({
  DECIMAL_PLACES: 80, // 足够精度，避免 DeFi 里丢失小数
  ROUNDING_MODE: BigNumber.ROUND_DOWN, // 通常用向下取整，避免超额
  EXPONENTIAL_AT: 1e9, // 禁止科学计数法
})

export function RoutesWrapper() {
  return useRoutes(routes)
}

const HOME_MENUS_PATH = ['/']
const NO_MENUS_PATH = ['/kyc/liveness-complete']

function App() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { account, chainId } = useActiveWeb3()
  const initBaseStore = useBaseStore(state => state.init)
  const refreshByLanguage = useBaseStore(state => state.refreshByLanguage)
  const isHomeMenus = useMemo(() => HOME_MENUS_PATH.includes(router.location.pathname), [router.location.pathname])
  const isNoMenus = useMemo(() => NO_MENUS_PATH.includes(router.location.pathname), [router.location.pathname])

  useEffect(() => {
    const lng = storage.getItem('CA_LANGUAGE') || 'en'
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng)
    }
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
    
    // 监听语言变化，重新获取 rwa 列表，因为 rwa 列表中的公司名称是根据语言返回的
    const handleLangChange = (lng: string) => {
      refreshByLanguage()
    }
    i18n.on('languageChanged', handleLangChange)

    return () => {
      wsService.close()
      i18n.off('languageChanged', handleLangChange)
    }
  }, [])

  return (
    <>
      <GoogleAnalytics />
      <ScrollToTop />
      {/* {
        !isNoMenus && (isHomeMenus ? <HomeMenus /> : <Menus />)
      } */}
      {
        !isNoMenus && !isHomeMenus && <Menus />
      }
      <RoutesWrapper />
      {createPortal(
        <Toaster position='top-right' />,
        document.getElementById('toast-root')!
      )}
      
      <Updater />

    </>
  )
}

export default App
