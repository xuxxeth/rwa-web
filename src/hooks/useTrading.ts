import type { Address } from "@/config/constants";
import { useTradingV2, useTradeUtilsV2 as useTradeUtilsCommon } from "@/hooks/useCaCommon";
import { useActiveWeb3 } from "./useActiveWe3";
import { useBaseStore } from "@/stores/baseStore";
import { useMemo } from "react";

export function useTrading(token: Address, amount: BigInt) {
  const { chainId } = useActiveWeb3()
  const chainList = useBaseStore(state => state.chainList)
  const trading = useMemo(() => {
    const chain = chainList.find(chain => chain.id === chainId)
    return chain?.contract as Address
  }, [chainId, chainList])

  const { placeOrder, refetchAllowance, txStep, approvalState, allowance } = useTradingV2(token, trading, amount)

  return {
    placeOrder,
    refetchAllowance,
    txStep,
    approvalState,
    allowance
  }
}

export function useTradeUtils() {
  const { chainId } = useActiveWeb3()
  const chainList = useBaseStore(state => state.chainList)
  const trading = useMemo(() => {
    const chain = chainList.find(chain => chain.id === chainId)
    return chain?.contract as Address
  }, [chainId, chainList])

  const { cancelOrder, txStep } = useTradeUtilsCommon(trading)

  return {
    cancelOrder,
    txStep
  }
}

