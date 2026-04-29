import { useBaseStore } from "@/stores/baseStore";
import { useEffect, useMemo, useRef, useState } from "react";

export function useMarketState() {
  const getMarketState = useBaseStore(state => state.getMarketState)


  // @ts-ignore
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

export function extractHourMinuteLocal(timestamp: number) {
  const localTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return extractHourMinute(timestamp, localTZ)
}

export function extractHourMinute(
  timestamp: number,
  timeZone = "America/New_York" // 默认 ET
) {
  const date = new Date(timestamp);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const get = (type: string, def: string) =>
    parts.find(p => p.type === type)?.value ?? def;

  const month = get("month", "Jan").toUpperCase();
  const day = get("day", "01");
  const hour = get("hour", "00");
  const minute = get("minute", "00");

  return {
    MN: month,
    D: day,
    H: hour,
    M: minute,
    label: `${month} ${day} ${hour}:${minute}`,
  };
}



export function useTradingStartTime() {
  const marketTradeState = useBaseStore(state => state.marketTradeState)
  const { tradingStartTime, tradingEndTime, preMarketMinutes, afterMarketMinutes, nightTradingStartTime, nightTradingEndTime } = useBaseStore(state => state.marketInfo)

  const [countdown, setCountdown] = useState({H: '00', M: '00', S: '00'});
  // const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // useEffect(() => {
  //   const updateCountdown = () => {
  //     const now = new Date();
  //     // 根据市场状态选择目标时间
  //     let targetTime = 0;
  //     // 如果是盘前，目标时间需要减去 preMarketMinutes；如果是盘后，目标时间需要加上 afterMarketMinutes
  //     if (marketTradeState === MARKET_STATUS.BEFORE) {
  //         targetTime = tradingStartTime;
  //     } else if (marketTradeState === MARKET_STATUS.OPEN) {
  //       targetTime = tradingEndTime;
  //     } else if (marketTradeState === MARKET_STATUS.AFTER) {
  //       targetTime = tradingEndTime + afterMarketMinutes * 60 * 1000;
  //     } else {
  //       targetTime = tradingStartTime - preMarketMinutes * 60 * 1000;
  //     }
  //     const targetDate = new Date(targetTime);
  //     const diffMs = targetDate.getTime() - now.getTime();
      
  //     if (diffMs <= 0) {
  //       return;
  //     }
      
  //     const totalSeconds = Math.floor(diffMs / 1000);
  //     const hours = Math.floor(totalSeconds / 3600);
  //     const minutes = Math.floor((totalSeconds % 3600) / 60);
  //     const seconds = totalSeconds % 60;
      
  //     setCountdown({
  //       H: hours.toString().padStart(2, '0'),
  //       M: minutes.toString().padStart(2, '0'),
  //       S: seconds.toString().padStart(2, '0')
  //     })
  //   };
    
  //   updateCountdown();
  //   timerRef.current = setInterval(updateCountdown, 1000);
    
  //   return () => {
  //     if (timerRef.current) {
  //         clearInterval(timerRef.current);
  //     }
  //   };
  // }, [tradingStartTime, tradingEndTime, preMarketMinutes, afterMarketMinutes, marketTradeState]);

  return useMemo(() => {

    if (!tradingStartTime || !tradingEndTime) return null
    
    return {
      tradeState: marketTradeState,
      tradingStartTime,
      tradingEndTime,
      countdown,
      openTime: extractHourMinute(tradingStartTime),
      closeTime: extractHourMinute(tradingEndTime),
      preOpenTime: extractHourMinute(tradingStartTime - preMarketMinutes * 60 * 1000),
      afterCloseTime: extractHourMinute(tradingEndTime + afterMarketMinutes * 60 * 1000),
      preCloseTime: extractHourMinute(tradingEndTime - 24 * 60 * 60 * 1000),
      nightTradingStartTime: extractHourMinute(nightTradingStartTime),
      nightTradingEndTime: extractHourMinute(nightTradingEndTime),
      openTimeLocal: extractHourMinuteLocal(tradingStartTime),
      closeTimeLocal: extractHourMinuteLocal(tradingEndTime),
      preOpenTimeLocal: extractHourMinuteLocal(tradingStartTime - preMarketMinutes * 60 * 1000),
      afterCloseTimeLocal: extractHourMinuteLocal(tradingEndTime + afterMarketMinutes * 60 * 1000),
      preCloseTimeLocal: extractHourMinuteLocal(tradingEndTime - 24 * 60 * 60 * 1000),
      nightTradingStartTimeLocal: extractHourMinuteLocal(nightTradingStartTime),
      nightTradingEndTimeLocal: extractHourMinuteLocal(nightTradingEndTime)
    }
  }, [tradingStartTime, tradingEndTime, countdown, marketTradeState, nightTradingStartTime, nightTradingEndTime])
}