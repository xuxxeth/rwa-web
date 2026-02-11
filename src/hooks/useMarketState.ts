import { MARKET_STATUS } from "@/config/constants";
import { useBaseStore } from "@/stores/baseStore";
import { useEffect, useMemo, useRef, useState } from "react";

export function useMarketState() {
  const getMarketState = useBaseStore(state => state.getMarketState)

  const marketTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const getMarketStateInterval = () => {
      getMarketState()
        .finally(() => {
          if (!marketTimer.current) {
            marketTimer.current = setTimeout(() => {
              marketTimer.current && clearTimeout(marketTimer.current)
              marketTimer.current = null
              getMarketStateInterval()
            }, 5000)
          }
          
        })
    }
    getMarketStateInterval()

    return () => {
      marketTimer.current && clearTimeout(marketTimer.current)
      marketTimer.current = null
    }
  }, [])

}

function extractHourMinute(timestamp: number) {
    const date = new Date(timestamp);
    const hours = date.getHours();    // 0-23
    const minutes = date.getMinutes(); // 0-59
    
    return {
        H: hours.toString().padStart(2, '0'),
        M: minutes.toString().padStart(2, '0'),
    };
}



export function useTradingStartTime() {
  const marketTradeState = useBaseStore(state => state.marketTradeState)
  const { tradingStartTime, tradingEndTime } = useBaseStore(state => state.marketInfo)

  const [countdown, setCountdown] = useState({H: '00', M: '00', S: '00'});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
      const updateCountdown = () => {
          const now = new Date();
          const targetTime = new Date(tradingStartTime);
          const diffMs = targetTime.getTime() - now.getTime();
          
          if (diffMs <= 0) {
            return;
          }
          
          const totalSeconds = Math.floor(diffMs / 1000);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          
          setCountdown({
            H: hours.toString().padStart(2, '0'),
            M: minutes.toString().padStart(2, '0'),
            S: seconds.toString().padStart(2, '0')
          })
      };
      
      updateCountdown();
      timerRef.current = setInterval(updateCountdown, 1000);
      
      return () => {
          if (timerRef.current) {
              clearInterval(timerRef.current);
          }
      };
  }, [tradingStartTime]);

  return useMemo(() => {

    if (!tradingStartTime || !tradingEndTime) return null
    
    return {
      tradeState: marketTradeState === MARKET_STATUS.OPEN,
      countdown,
      openTime: extractHourMinute(tradingStartTime),
      closeTime: extractHourMinute(tradingEndTime)
    }
  }, [tradingStartTime, tradingEndTime, countdown, marketTradeState])
}