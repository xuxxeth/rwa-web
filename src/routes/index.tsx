// src/router/routes.tsx
import { lazy, type ReactElement } from "react";
import { Outlet } from "react-router-dom";

// 懒加载页面
const Home = lazy(() => import("../views/home"));
const LiteTrade = lazy(() => import("../views/lite-trade"));
const Markets = lazy(() => import("../views/markets"));
const About = lazy(() => import("../views/about"));
const KLine = lazy(() => import("../views/kline"));
const KLineAAPL = lazy(() => import("../views/kline-aapl"));
const NotFound = lazy(() => import("../views/not-found"));
const Components = lazy(() => import("../views/components"));

// Markets children routes
const MarketTrading = lazy(() => import("../views/markets/MarketTrading"));
const MarketData = lazy(() => import("../views/markets/marketData"));

// 路由配置类型
export interface RouteConfig {
  path: string;
  element: ReactElement;
  children?: RouteConfig[];
}

// 路由表
const routes: RouteConfig[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/markets",
    element: (
      <Markets>
        <Outlet />
      </Markets>
    ),
    children: [
      {
        path: "data",
        element: <MarketData />,
      },
      {
        path: "trading",
        element: <MarketTrading />,
      },
    ],
  },
  {
    path: "/lite-trade",
    element: <LiteTrade />,
  },
  {
    path: "/kline",
    element: <KLine />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/com",
    element: <Components />,
  },
  {
    path: "/kline-aapl",
    element: <KLineAAPL />,
  },
  {
    path: "*", // 兜底路由
    element: <NotFound />,
  },
];

export default routes;
