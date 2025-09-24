// src/router/routes.tsx
import { lazy, type ReactElement } from "react";

// 懒加载页面
const Home = lazy(() => import("../views/home"));
const LiteTrade = lazy(() => import("../views/lite-trade"));
const About = lazy(() => import("../views/about"));
const KLine = lazy(() => import("../views/kline"));
const KLineAAPL = lazy(() => import("../views/kline-aapl"));
const NotFound = lazy(() => import("../views/not-found"));
const Components = lazy(() => import("../views/components"));

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

