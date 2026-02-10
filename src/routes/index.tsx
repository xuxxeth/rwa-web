// src/router/routes.tsx
import { lazy } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'

// 懒加载页面
// const Home = lazy(() => import('../views/home'))

const Home = lazy(() => import('../views/home/v2'))

const LiteTrade = lazy(() => import('../views/lite-trade/indexv2'))
const Markets = lazy(() => import('../views/markets'))
const About = lazy(() => import('../views/about'))
const KLine = lazy(() => import('../views/kline'))
const KLineAAPL = lazy(() => import('../views/kline-aapl'))
const NotFound = lazy(() => import('../views/not-found'))
const Components = lazy(() => import('../views/components'))

// Markets children routes
const MarketTrading = lazy(() => import('../views/markets/MarketTrading'))
const MarketQuotes = lazy(() => import('../views/markets/MarketQuotes'))
const Identity = lazy(() => import('../views/identity'))
const LivenessComplete = lazy(() => import('../views/identity/LivenessComplete'))

// const Assets = lazy(() => import('../views/assets'))
const Portfolio = lazy(() => import('../views/assets/v2'))

// 路由表
const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/markets',
    element: <MarketQuotes />,
    // children: [
    //   {
    //     index: true,
    //     element: <Navigate to='quotes' replace />,
    //   },
    //   {
    //     path: 'quotes',
    //     element: <MarketQuotes />,
    //   },
    //   {
    //     path: 'trading',
    //     element: <MarketTrading />,
    //   },
    //   {
    //     path: 'trading/:symbol',
    //     element: <MarketTrading />,
    //   },
    // ],
  },
  {
    path: '/trade/:symbol?',
    element: <MarketTrading />,
  },
  {
    path: '/lite-trade/:symbol?',
    element: <LiteTrade />,
  },
  {
    path: '/portfolio',
    element: <Portfolio />,
  },
  {
    path: '/order',
    element: <Portfolio />,
  },
  {
    path: '/identity',
    element: <Identity />,
  },
  {
    path: '/kyc/liveness-complete',
    element: <LivenessComplete />,
  },
  {
    path: '/kline',
    element: <KLine />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/com',
    element: <Components />,
  },
  {
    path: '/kline-aapl',
    element: <KLineAAPL />,
  },
  {
    path: '*', // 兜底路由
    element: <NotFound />,
  },
]

export default routes
