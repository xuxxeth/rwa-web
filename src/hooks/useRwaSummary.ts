import type { IRwa } from "@/service/base/types";
import { useWssStore } from "@/stores/wssStore";
import { symbolToLower, truncate } from "@/utils";
import { useMemo } from "react";


export function useRwaSummary(token: IRwa | null) {
     
  const originSummary = useWssStore(state => state.originSummary)

  return useMemo(() => {
    if (originSummary.length === 0 || !token) return null
    const rwa = originSummary.find(item => symbolToLower(item.S) === symbolToLower(token?.symbol)) || null
    
    if (rwa) {
      return {
        s: rwa.s, // 成交量
        S: rwa.S, // 股票Symbol
        p: truncate(rwa.p || 0, token?.precision), // 最新价
        o: truncate(rwa.o || 0, token?.precision), // 今开价
        l: truncate(rwa.l || 0, token?.precision), // 最低价
        h: truncate(rwa.h || 0, token?.precision), // 最高价
        c: truncate(rwa.c || 0, token?.precision), // 当日收盘价
        pc: truncate(rwa.pc || 0, token?.precision), // 昨日收盘价
        T: rwa.T, // 时间戳(秒)
      }
    }
    return null

  }, [originSummary, token]);

}