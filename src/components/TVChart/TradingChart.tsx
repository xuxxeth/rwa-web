import { useScript } from "@/hooks/useScript";
import { lazy, useEffect } from "react";

const TVChartContainer = lazy(() => import("@/components/TVChart/TVChartContainer"))

export const TradingChart = () => {
  const status = useScript("/libraries/datafeeds/udf/dist/bundle.js");
  const statusLibrary = useScript("/libraries/charting_library/charting_library.js");

  useEffect(() => {
    if (status === "ready" && statusLibrary === "ready") {
      // 脚本加载完成后调用全局方法
      
    }
  }, [status]);

  return (status === 'ready' && statusLibrary === 'ready') ? <TVChartContainer /> : null

}