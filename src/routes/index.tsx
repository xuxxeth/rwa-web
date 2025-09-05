// src/router/routes.tsx
import { lazy, type ReactElement } from "react";

// 懒加载页面
const Home = lazy(() => import("../views/home"));
const About = lazy(() => import("../views/about"));
const NotFound = lazy(() => import("../views/not-found"));

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
    path: "/about",
    element: <About />,
  },
  {
    path: "*", // 兜底路由
    element: <NotFound />,
  },
];

export default routes;

