import type { IRwa } from "@/service/base/types"
import type { ISummaryDataItem } from "@/service/webSocket/types"
import { useTradeStore } from "@/stores/tradeStore"
import { truncate } from "@/utils/format"
import { useEffect } from "react"
import wsService from "@/service/webSocket/service"

export function useRealtimeRwa(inputToken: IRwa | null) {

  const setRealtimeData = useTradeStore(state => state.setRealtimeRwaData)
  
  useEffect(() => {
    let onKey = ''
    let listener = null
    if (inputToken?.symbol) {
      onKey = `realtime.${inputToken.symbol}`
      listener = (rwa: ISummaryDataItem) => {
        const precision = inputToken?.precision
        const _data = {
          ...rwa,
          p: truncate(rwa.p || 0, precision), // 最新价
          o: truncate(rwa.o || 0, precision), // 今开价
          l: truncate(rwa.l || 0, precision), // 最低价
          h: truncate(rwa.h || 0, precision), // 最高价
          c: truncate(rwa.c || 0, precision), // 当日收盘价
          pc: truncate(rwa.pc || 0, precision), // 昨日收盘价
        } as any
        setRealtimeData(_data)
      }
      // @ts-ignore
      wsService.on(onKey, listener)
    }

    return () => {
      if (onKey && listener) {
        // @ts-ignore
        wsService.off(onKey, listener)
      }
    }
  }, [inputToken])
}