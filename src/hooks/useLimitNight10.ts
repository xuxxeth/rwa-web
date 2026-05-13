import { useEffect, useRef, useState } from "react";

function getNextETTime(hour: number, minute: number = 0): Date {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error(`Invalid hour: ${hour}`)
  }

  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new Error(`Invalid minute: ${minute}`)
  }

  const now = new Date()

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  })

  const getETParts = (date: Date) => {
    const parts = formatter.formatToParts(date)

    const getPartNumber = (type: Intl.DateTimeFormatPartTypes): number => {
      const value = parts.find((part) => part.type === type)?.value

      if (value === undefined) {
        throw new Error(`Missing date part: ${type}`)
      }

      const num = Number(value)
      if (Number.isNaN(num)) {
        throw new Error(`Invalid date part: ${type}=${value}`)
      }

      return num
    }

    return {
      year: getPartNumber('year'),
      month: getPartNumber('month'),
      day: getPartNumber('day'),
      hour: getPartNumber('hour'),
      minute: getPartNumber('minute'),
    }
  }

  const etNow = getETParts(now)

  const buildETDate = (year: number, month: number, day: number) => {
    for (const offsetHours of [4, 5]) {
      const candidate = new Date(Date.UTC(year, month - 1, day, hour + offsetHours, minute, 0))
      const candidateET = getETParts(candidate)

      if (
        candidateET.year === year &&
        candidateET.month === month &&
        candidateET.day === day &&
        candidateET.hour === hour &&
        candidateET.minute === minute
      ) {
        return candidate
      }
    }

    throw new Error(`Unable to resolve ET time for ${year}-${month}-${day} ${hour}:${minute}`)
  }

  let target = buildETDate(etNow.year, etNow.month, etNow.day)

  if (target <= now) {
    const nextDayBase = new Date(Date.UTC(etNow.year, etNow.month - 1, etNow.day + 1))
    const nextDayET = getETParts(nextDayBase)
    target = buildETDate(nextDayET.year, nextDayET.month, nextDayET.day)
  }

  return target
}


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

const endTime = getNextETTime(4, 0)

// const endTime = new Date(2026,3,30,12,12,0)
const limitDuration = 10 * 60 * 1000


export function useDisabledNight10() {
  const [disabled, setDisabled] = useState(false)
  // const timerRef = useRef<NodeJS.Timeout | null>(null);

  // useEffect(() => {
  //   const updateDisabled = () => {
  //     const nowTime = new Date().getTime();
  //     const _endTime = endTime.getTime()
  //     if (_endTime > nowTime) {
  //       if (nowTime < _endTime && _endTime - nowTime <= limitDuration) {
  //         setDisabled(true)
  //       }
  //       // 当前时间过了夜盘时间，夜盘可选
  //       if (nowTime > _endTime) {
  //         setDisabled(false)
  //         if (timerRef.current) {
  //           clearInterval(timerRef.current);
  //         }
  //       }
  //     }
  //   }

  //   timerRef.current = setInterval(updateDisabled, 1000);
    
  //   return () => {
  //     if (timerRef.current) {
  //       clearInterval(timerRef.current);
  //     }
  //   };

  // }, [])

  return {
    disabled
  }
  
}
