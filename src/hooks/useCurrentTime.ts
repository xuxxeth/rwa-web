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

function getNewYorkTime() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);

  const hour = parts.find(p => p.type === "hour")?.value ?? "00";
  const minute = parts.find(p => p.type === "minute")?.value ?? "00";

  return `${hour}:${minute}`;
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