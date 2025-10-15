import wsService, { type EventType } from "@/service/webSocket/service";
import { useEffect, useRef } from "react";

export function useWssOn(evnet?: EventType, callback?: (data: any) => void) {
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
    evnet && wsService.on(evnet, listener)

    return () => {
      framePending.current = false
      evnet && wsService.off(evnet, listener)
    }
  }, [])

  return {
    wsService
  }
  
}