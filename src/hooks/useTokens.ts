import { useMemo } from "react";
import { useChainId } from "./useCaCommon";
import { useBaseStore } from "@/stores/baseStore";

export function useRwaTokens() {
  const chainId = useChainId();
  const baseStore = useBaseStore();

  const rwaList = useMemo(() => baseStore.rwaList, [baseStore.rwaList]);

  return chainId ? rwaList ?? [] : [];
}

export function useTokens() {
  const baseStore = useBaseStore();
  const chainId = useChainId();
  const tokenList = useMemo(() => baseStore.tokenList, [baseStore.tokenList]);

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
