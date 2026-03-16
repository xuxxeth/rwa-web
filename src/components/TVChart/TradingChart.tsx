import { useScript } from "@/hooks/useScript";
import { cn } from "@/lib/utils";
import { useTradeStore } from "@/stores/tradeStore";
import { lazy, memo, useEffect, useState } from "react";
import { IntradayLineChart } from "@/components/TVChart/IntradayLineChart";

const TVChartContainer = lazy(() => import("@/components/TVChart/TVChartContainer"))

export const TradingChart = memo(
  ({ from, mode = "tv", session = "pre" }: { from?: string; mode?: "tv" | "line"; session?: "pre" | "after" }) => {
    // const status = useScript("/libraries/datafeeds/udf/dist/bundle.js");
    const statusLibrary = useScript("/libraries/charting_library/charting_library.js");
    const [ready, setReady] = useState(false);
    const inputToken = useTradeStore(state => state.inputToken)

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


    if (mode === "line") {
      return <IntradayLineChart from={from} session={session} />
    }

    return ready && inputToken?.address ? (
      <TVChartContainer token={inputToken} from={from} />
    ) : (
      <div className={cn(
        "",
        from === 'market' ? "h-[500px]" : "h-[300px]"
      )}></div>
    )

  }
) 
