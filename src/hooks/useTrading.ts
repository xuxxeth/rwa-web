import type { Address } from "@/config/constants";
import { useTrading as useTradingCommon, useTradeUtils as useTradeUtilsCommon } from "@/hooks/useCaCommon";
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

  console.log('chain trading: ', trading)

  const { placeOrder, approve, refetchAllowance, approvalState, allowance } = useTradingCommon(token, trading, amount)

  return {
    placeOrder,
    approve,
    refetchAllowance,
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

  const { cancelOrder } = useTradeUtilsCommon(trading)

  return {
    cancelOrder
  }
}

