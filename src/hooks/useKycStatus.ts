import { CONNECT_ACCOUNT, ID_EXPIRES, RISK_STATUS } from "@/config/constants";
import { useEffect, useMemo, useState } from "react";
import { useActiveWeb3 } from "./useActiveWe3";
import { useTradeStore } from "@/stores/tradeStore";
import { useKycStore } from "@/stores/kycStore";
import { formatSecondsToDateTime } from "@/utils/format";
import { KYC_OVERALL_STATUS } from "@/service/kyc/types";
import storage from "@/utils/storage";

export function useFetchKycStatus() {
  const { chainId, account } = useActiveWeb3()  
  const fetchKycStatus = useKycStore(state => state.fetchKycStatus)
  const isSignatureValid = useTradeStore(state => state.isSignatureValid)
  useEffect(() => {
    if (chainId && account || isSignatureValid) {
      storage.setItem(CONNECT_ACCOUNT, account!)
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
    if (status === 5) return RISK_STATUS.EXPIRED
    if (status === 9) return RISK_STATUS.ISSUE
    // 0 未认证
    return RISK_STATUS.NOTVERIFIED
  }, [status])
  
  return {
    kycStatus,
  }
}
export function useKycExpired() {
  const kycStatus = useKycStore(state => state.kycStatus)

  return useMemo(() => {
    const expires = Number(kycStatus?.expiresTime)
    if (expires <= 0) {
      return {
        expiring: false,
        expired: false,
        expiresTime: 0,
        desc: ''
      }
    }
    const now = Date.now()
    
    return {
      expiring: expires - ID_EXPIRES < now && expires > now,
      expired: kycStatus?.status === KYC_OVERALL_STATUS.EXPIRED,
      expiresTime: kycStatus?.expiresTime,
      desc: formatSecondsToDateTime(Math.floor((kycStatus?.expiresTime || 0) / 1000))
    }
  }, [kycStatus])
  
}

export function useKycRiskLevel() {
  const kycDetail = useKycStore(state => state.kycDetail)

  return useMemo(() => kycDetail?.riskLevel ?? 0, [kycDetail])
}