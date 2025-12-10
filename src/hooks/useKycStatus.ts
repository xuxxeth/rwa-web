import { RISK_STATUS } from "@/config/constants";
import { useEffect, useMemo, useState } from "react";
import { useActiveWeb3 } from "./useActiveWe3";
import { useTradeStore } from "@/stores/tradeStore";
import { useKycStore } from "@/stores/kycStore";

export function useFetchKycStatus() {
  const { chainId, account } = useActiveWeb3()  
  const fetchKycStatus = useKycStore(state => state.fetchKycStatus)
  const isSignatureValid = useTradeStore(state => state.isSignatureValid)
  useEffect(() => {
    if (chainId && account || isSignatureValid) {
      fetchKycStatus()
    }
  }, [chainId, account, isSignatureValid])
}

export function useKycStatus() {
  const status = useKycStore(state => state.kycStatus?.status)
  const kycStatus = useMemo(() => {
    if (status === undefined) return RISK_STATUS.DEFAULT
    if (status === -1) return RISK_STATUS.NOTSIGN
    if (status === 1) return RISK_STATUS.VERIFYING
    if (status === 2) return RISK_STATUS.VERIFIED
    if (status === 3) return RISK_STATUS.REJECTED
    if (status === 4) return RISK_STATUS.REVIEW
    // 0 未认证
    return RISK_STATUS.NOTVERIFIED
  }, [status])
  
  return {
    kycStatus,
  }
}