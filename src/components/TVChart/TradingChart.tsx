import { useScript } from "@/hooks/useScript";
import { useTradeStore } from "@/stores/tradeStore";
import { lazy, useEffect, useState } from "react";

const TVChartContainer = lazy(() => import("@/components/TVChart/TVChartContainer"))

export const TradingChart = () => {
  // const status = useScript("/libraries/datafeeds/udf/dist/bundle.js");
  const statusLibrary = useScript("/libraries/charting_library/charting_library.js");
  const [ready, setReady] = useState(false);
  const inputToken = useTradeStore(state => state.inputToken)
  console.log(inputToken, 222222)

  useEffect(() => {
    if (statusLibrary === "ready") {
      
      const check = () => {
        if (window.TradingView?.widget) {
          setReady(true)
          console.log('脚本加载完成')
        }
        else setTimeout(check, 100);
      };
      check();
    }
  }, [statusLibrary]);

  return ready ? <TVChartContainer /> : <div className="h-[600px]"></div>

}