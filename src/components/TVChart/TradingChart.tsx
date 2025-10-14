import { useScript } from "@/hooks/useScript";
import { lazy, useEffect, useState } from "react";

const TVChartContainer = lazy(() => import("@/components/TVChart/TVChartContainer"))

export const TradingChart = () => {
  const status = useScript("/libraries/datafeeds/udf/dist/bundle.js");
  const statusLibrary = useScript("/libraries/charting_library/charting_library.js");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === "ready" && statusLibrary === "ready") {
      // 脚本加载完成后调用全局方法
      console.log('脚本加载完成')
      const check = () => {
        if (window.TradingView?.widget) setReady(true);
        else setTimeout(check, 100);
      };
      check();
    }
  }, [status, statusLibrary]);

  return ready ? <TVChartContainer /> : <div className="h-[600px]"></div>

}