import { useEffect, useState } from "react";
import { extractHourMinute } from "./useMarketState";

export function useCurrentTime(interval = 1000) {
  const [time, setTime] = useState(() =>
    extractHourMinute(Date.now())
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(extractHourMinute(Date.now()));
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return time;
}