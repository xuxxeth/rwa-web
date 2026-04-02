import type { IRwa } from "@/service/base/types"
import type { ISummaryDataItem } from "@/service/webSocket/types"
import { useTradeStore } from "@/stores/tradeStore"
import { truncate } from "@/utils/format"
import { useEffect, useRef } from "react"
import wsService from "@/service/webSocket/service"

export function useRealtimeRwa(inputToken: IRwa | null) {

  const setRealtimeData = useTradeStore(state => state.setRealtimeRwaData)
  const subscribeVersionRef = useRef(0)
  const prevSymbolRef = useRef<string>("")
  const tokenMetaRef = useRef<{ id?: number; precision?: number }>({})
  const symbol = inputToken?.symbol || ""

  useEffect(() => {
    tokenMetaRef.current = {
      id: inputToken?.id,
      precision: inputToken?.precision,
    }
  }, [inputToken?.id, inputToken?.precision])
  
  useEffect(() => {
    let onKey = ''
    let listener: ((rwa: ISummaryDataItem) => void) | null = null
    const currentVersion = subscribeVersionRef.current + 1
    subscribeVersionRef.current = currentVersion
    if (symbol) {
      // 仅在 symbol 真变化时置空，避免初始化阶段重复闪烁
      if (prevSymbolRef.current !== symbol) {
        setRealtimeData({
          s: tokenMetaRef.current.id,
          S: symbol,
          p: 0,
          o: 0,
          l: 0,
          h: 0,
          c: 0,
          pc: 0,
        } as any)
        prevSymbolRef.current = symbol
      }
      onKey = `realtime.${symbol}`
      listener = (rwa: ISummaryDataItem) => {
        // 避免 off 延迟导致旧 symbol 的消息回灌
        if (subscribeVersionRef.current !== currentVersion) return
        const precision = tokenMetaRef.current.precision ?? 2
        const _data = {
          ...rwa,
          s: tokenMetaRef.current.id,
          S: symbol,
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
    } else {
      prevSymbolRef.current = ""
      setRealtimeData(null)
    }

    return () => {
      subscribeVersionRef.current += 1
      if (onKey && listener) {
        // @ts-ignore
        wsService.off(onKey, listener)
      }
    }
  }, [symbol, setRealtimeData])
}
