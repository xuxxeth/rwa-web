import { useAppStore } from "@/stores/appStore";
import { useBaseStore } from "@/stores/baseStore";
import { useMemo } from "react";


export function useChainById(chainId?: number) {
  const chainList = useBaseStore(state => state.chainList)

  return useMemo(() => {
    return chainId ? chainList.find(chain => chain.id === chainId) : null
  }, [chainId, chainList])
}


export function useCurrentChain() {
  const currentChainId = useAppStore(state => state.currentChainId)
  const chainList = useBaseStore(state => state.chainList)

  return useMemo(() => {
    return currentChainId ? chainList.find(chain => chain.id === currentChainId) : null
  }, [currentChainId, chainList])
}