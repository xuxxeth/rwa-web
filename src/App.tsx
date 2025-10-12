import { BrowserRouter, useRoutes } from "react-router-dom";
import BigNumber from "bignumber.js";
import routes from "./routes";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Suspense, useEffect } from "react";
import storage from "./utils/storage";
import { useTranslation } from "./hooks/useTranslation";

import { Toaster } from "./components/ui/sonner";
import { useBaseStore } from "./stores/baseStore";
import { useTokenBalances } from "./hooks/useTokenBalances";
import { useRwaBalances } from "./hooks/useRwaBalances";
import { scanApi } from "@/service/scan/api";
import { useActiveWeb3 } from "./hooks/useActiveWe3";
import wsService from "./service/WebSocketService";

BigNumber.config({
  DECIMAL_PLACES: 80, // 足够精度，避免 DeFi 里丢失小数
  ROUNDING_MODE: BigNumber.ROUND_DOWN, // 通常用向下取整，避免超额
  EXPONENTIAL_AT: 1e9, // 禁止科学计数法
});

function RoutesWrapper() {
  
  return useRoutes(routes);
}

function App() {
  const { t, i18n } = useTranslation();
  const { account, chainId } = useActiveWeb3()
  const updateRwasPrice = useBaseStore(state => state.updateRwasPrice)
  const updateStocksPrice = useBaseStore(state => state.updateStocksPrice)
  const initBaseStore = useBaseStore(state => state.init)

  // const getChains = useBaseStore(state => state.getChains)
  // const getMarket = useBaseStore(state => state.getMarket)
  // const getStocks = useBaseStore(state => state.getStocks)

  useEffect(() => {
    const lng = storage.getItem("CA_LANGUAGE") || "en";
    i18n.changeLanguage(lng);
  }, [i18n]);

  // 两个汇总到一起处理了
  // 获取余额信息
  // useTokenBalances()
  // 获取Rwa余额
  // useRwaBalances()

  useEffect(() => {
    if(!chainId) return
    // 初始化baseStore
    initBaseStore(chainId)
  }, [chainId])
  
  useEffect(() => {
    wsService.init({})
    wsService.subscribe(["summary"], (data) => {
      if (data.type === 'summary') {
        updateRwasPrice(data.data || [])
        updateStocksPrice(data.data || [])
      }
    })

    return () => {
      wsService.close()
    }
  }, [])
  
  return (
    <ErrorBoundary fallback={<h2>{t("pageError")}</h2>}>
      <Suspense fallback={<div>{t("Loading")}...</div>}>
        <BrowserRouter>
          <RoutesWrapper />
        </BrowserRouter>
        <Toaster position="top-center" />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
