import { useBaseStore } from "@/stores/baseStore";
import { useEffect, useRef, useState } from "react";

function getTimeRemaining(endTime: number) {
  const total = new Date(endTime).getTime() - Date.now();
  
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  return {
    days,
    hours,
    minutes,
    seconds,
    total
  };
}

// const endTime = new Date(2026,3,30,11,15,0)
const limitDuration = 10 * 60 * 1000

export function useDisabledNight10() {
  const [disabled, setDisabled] = useState(false)
  const { nightTradingEndTime } = useBaseStore(state => state.marketInfo)
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateDisabled = () => {
      const nowTime = new Date().getTime();
      if (nightTradingEndTime > nowTime) {
        const _endTime = new Date(nightTradingEndTime).getTime()
        // const _endTime = endTime.getTime()
        if (nowTime < _endTime && _endTime - nowTime <= limitDuration) {
          setDisabled(true)
        }
        // 当前时间过了夜盘时间，夜盘可选
        if (nowTime > _endTime) {
          setDisabled(false)
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        }
      }
    }

    timerRef.current = setInterval(updateDisabled, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };

  }, [nightTradingEndTime])

  return {
    disabled
  }
  
}