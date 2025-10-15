import wsService, { type EventType } from "@/service/webSocket/service";
import { useEffect, useRef } from "react";

export function useWssOn(event?: EventType, callback?: (data: any) => void) {
  const framePending = useRef<Boolean>(false)

  useEffect(() => {
    wsService.init({})
    const listener = (data: any) => {
      if (!framePending.current) {
        framePending.current = true
        requestAnimationFrame(() => {
          callback && callback(data)
          framePending.current = false
        })
      }
    }
    event && wsService.on(event, listener)
    return () => {
      framePending.current = false
      event && wsService.off(event, listener)
    }
  }, [])

  return {
    wsService
  }
  
}