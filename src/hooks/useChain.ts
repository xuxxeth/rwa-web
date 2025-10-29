import { useBaseStore } from "@/stores/baseStore";
import { useMemo } from "react";


export function useChainById(chainId?: number) {
  const chainList = useBaseStore(state => state.chainList)

  return useMemo(() => {
    return chainId ? chainList.find(chain => chain.id === chainId) : null
  }, [chainId, chainList])
}