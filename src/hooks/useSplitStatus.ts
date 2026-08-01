import type { IRwa } from "@/service/base/types";
import { useMemo } from "react";
import { useBaseStore } from "@/stores/baseStore";
import { symbolToLower } from "@/utils";
import { useRwaTokens } from "./useTokens";


export function useSplitStatus(token?: IRwa | null) {
  const rwaList = useRwaTokens(true)
  const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)
  // 查询所有相同symbol的rwa,
  const filterList = useMemo(() => {
    return rwaList.filter(rwa => rwa.symbol === token?.symbol && rwa.splitStatus === 1)
  }, [token, rwaList])

  const filterListBalance = useMemo(() => {
    if (filterList.length <= 0) return []
    return filterList.filter(rwa => tokenWithBalance[symbolToLower(rwa.address)])
  }, [filterList, tokenWithBalance])

  return filterListBalance

}