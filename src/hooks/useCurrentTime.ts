import { useEffect, useState } from "react";
import { extractHourMinute } from "./useMarketState";

// export function useCurrentTime(interval = 1000) {
//   const [time, setTime] = useState(() =>
//     extractHourMinute(Date.now())
//   );

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTime(extractHourMinute(Date.now()));
//     }, interval);

//     return () => clearInterval(timer);
//   }, [interval]);

//   return time;
// }

export function getNewYorkTime() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short", // JAN / FEB 这种
    hour12: false,
  });

  const parts = formatter.formatToParts(now);

  const hour = parts.find(p => p.type === "hour")?.value ?? "00";
  const minute = parts.find(p => p.type === "minute")?.value ?? "00";
  const day = parts.find(p => p.type === "day")?.value ?? "01";
  const month = parts.find(p => p.type === "month")?.value?.toUpperCase() ?? "JAN";

  return {
    MN: month, // JAN
    D: day,
    H: hour,
    M: minute,
    label: `${month} ${day} ${hour}:${minute}`,
  };
}

export function useCurrentTime(interval = 1000) {
  const [time, setTime] = useState(() => getNewYorkTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getNewYorkTime());
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return time;
}