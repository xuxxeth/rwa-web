import { useScript } from "@/hooks/useScript";
import { useWssOn } from "@/hooks/useWssOn";
import { cn } from "@/lib/utils";
import { useBaseStore } from "@/stores/baseStore";
import { useTradeStore } from "@/stores/tradeStore";
import { useWssStore } from "@/stores/wssStore";
import { lazy, memo, useEffect, useState } from "react";

const TVChartContainer = lazy(() => import("@/components/TVChart/TVChartContainer"))

export const TradingChart = memo(
  ({ from }: { from?: string }) => {
    // const status = useScript("/libraries/datafeeds/udf/dist/bundle.js");
    const statusLibrary = useScript("/libraries/charting_library/charting_library.js");
    const [ready, setReady] = useState(false);
    const inputToken = useTradeStore(state => state.inputToken)

    const setTokenWithPriceByWebSocketData = useBaseStore(
        state => state.setTokenWithPriceByWebSocketData
      )
    const setStockWithPriceByWebSocketData = useBaseStore(
      (state) => state.setStockWithPriceByWebSocketData
    );
    const stableTokenWithPrice = useWssStore(state => state.setStableTokenWithPrice)
    
    useWssOn('summary', (data: any) => {
      setTokenWithPriceByWebSocketData(data || [])
      setStockWithPriceByWebSocketData(data || [])
      stableTokenWithPrice(data || [])
    })

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


    return ready && inputToken?.address ? 
      <TVChartContainer token={inputToken} from={from} /> : 
      <div className={cn(
        "",
        from === 'market' ? "h-[600px]" : "h-[300px]"
      )}></div>

  }
) 