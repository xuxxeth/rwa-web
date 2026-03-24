import { MARKET_STATUS } from "@/config/constants";
import { useBaseStore } from "@/stores/baseStore";
import { ta } from "date-fns/locale";
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

export function extractHourMinute(timestamp: number) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const month = date.getMonth(); // 0-11
    const day = date.getDate();    // 1-31

    const months = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];

    return {
      MN: months[month],
      D: day.toString().padStart(2, '0'),
      H: hours.toString().padStart(2, '0'),
      M: minutes.toString().padStart(2, '0'),
      label: `${months[month]} ${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    };
}



export function useTradingStartTime() {
  const marketTradeState = useBaseStore(state => state.marketTradeState)
  const { tradingStartTime, tradingEndTime, preMarketMinutes, afterMarketMinutes } = useBaseStore(state => state.marketInfo)

  const [countdown, setCountdown] = useState({H: '00', M: '00', S: '00'});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // 根据市场状态选择目标时间
      let targetTime = 0;
      // 如果是盘前，目标时间需要减去 preMarketMinutes；如果是盘后，目标时间需要加上 afterMarketMinutes
      if (marketTradeState === MARKET_STATUS.BEFORE) {
          targetTime = tradingStartTime;
      } else if (marketTradeState === MARKET_STATUS.OPEN) {
        targetTime = tradingEndTime;
      } else if (marketTradeState === MARKET_STATUS.AFTER) {
        targetTime = tradingEndTime + afterMarketMinutes * 60 * 1000;
      } else {
        targetTime = tradingStartTime - preMarketMinutes * 60 * 1000;
      }
      const targetDate = new Date(targetTime);
      const diffMs = targetDate.getTime() - now.getTime();
      
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
  }, [tradingStartTime, tradingEndTime, preMarketMinutes, afterMarketMinutes, marketTradeState]);

  return useMemo(() => {

    if (!tradingStartTime || !tradingEndTime) return null
    
    return {
      tradeState: marketTradeState,
      countdown,
      openTime: extractHourMinute(tradingStartTime),
      closeTime: extractHourMinute(tradingEndTime),
      preOpenTime: extractHourMinute(tradingStartTime - preMarketMinutes * 60 * 1000),
      afterCloseTime: extractHourMinute(tradingEndTime + afterMarketMinutes * 60 * 1000),
      preCloseTime: extractHourMinute(tradingEndTime - 24 * 60 * 60 * 1000),
    }
  }, [tradingStartTime, tradingEndTime, countdown, marketTradeState])
}