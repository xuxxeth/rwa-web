import { useMemo } from "react";
import { useChainId } from "./useCaCommon";
import { useBaseStore } from "@/stores/baseStore";

export function useRwaTokens() {
  const chainId = useChainId();
  const rwaList = useBaseStore(state => state.rwaList);
  return chainId ? rwaList ?? [] : [];
}

export function useTokens() {
  const tokenList = useBaseStore(state => state.tokenList);
  const chainId = useChainId();
  return useMemo(() => {
    if (chainId && tokenList) {
      return tokenList.filter((token) => token.chainId === chainId);
    }
    return [];
  }, [chainId, tokenList]);
}

export function useUSDT() {
  const tokens = useTokens();
  return useMemo(() => {
    return tokens.find((token) => token.symbol === "USDT");
  }, [tokens]);
}
