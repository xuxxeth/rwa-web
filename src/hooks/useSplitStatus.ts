import type { IRwa } from "@/service/base/types";
import { useRwas } from "./useRwaBalances";
import { useMemo } from "react";
import { useBaseStore } from "@/stores/baseStore";
import { symbolToLower } from "@/utils";


export function useSplitStatus(token?: IRwa | null) {
  const rwaList = useRwas()
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