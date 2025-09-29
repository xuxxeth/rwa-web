import { useMemo } from "react";
import { useChainId } from "./useCaCommon";
import { useBaseStore } from "@/stores/baseStore";


export function useTokens() {
  const baseStore = useBaseStore()
  const chainId = useChainId()
  const tokenList = useMemo(() => baseStore.tokenList, [baseStore.tokenList])

  return useMemo(() => {
    if (chainId && tokenList) {
      return tokenList.filter(token => token.chainId === chainId)
    }
    return []
  },[ chainId, tokenList])

}