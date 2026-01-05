import { useEffect } from 'react'
import ReactGA from 'react-ga4'
import { useLocation } from 'react-router-dom'

// 环境变量中读取 MEASUREMENT_ID
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

const GoogleAnalytics = () => {
  const location = useLocation()

  useEffect(() => {
    // 只有在配置了 ID 的情况下才初始化
    if (MEASUREMENT_ID) {
      // 初始化 GA4
      ReactGA.initialize(MEASUREMENT_ID)
    }
  }, [])

  useEffect(() => {
    if (MEASUREMENT_ID) {
      // 发送页面浏览事件
      ReactGA.send({
        hitType: 'pageview',
        page: location.pathname + location.search,
        title: document.title,
      })
    }
  }, [location])

  useEffect(() => {}, [location])

  return null
}

export default GoogleAnalytics
