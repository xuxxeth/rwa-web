import { RISK_STATUS } from "@/config/constants";
import { useKycStore } from "@/stores/kycStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { useActiveWeb3 } from "./useActiveWe3";
import { riskApi } from "@/service/risk/api";
import { useTradeStore } from "@/stores/tradeStore";

export function useRiskUserConfig() {
  const { chainId, account } = useActiveWeb3()
  const getUserConfig = useKycStore(state => state.getUserConfig)
  const isSignatureValid = useTradeStore(state => state.isSignatureValid)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const shouldFetch = !!(chainId && account) || isSignatureValid

    if (!shouldFetch) return

    const fetchUserConfig = () => {
      getUserConfig()
        .finally(() => {
          if (!timerRef.current) {
            timerRef.current = setTimeout(() => {
              if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
              }
              fetchUserConfig()
            }, 30000)
          }
        })
    }

    fetchUserConfig()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [chainId, account, isSignatureValid, getUserConfig])
}


export function useRiskStatus() {
  const riskUserConfig = useKycStore(state => state.riskUserConfig)
  const getUserConfig = useKycStore(state => state.getUserConfig)
  let getCount = 0

  const startGetUserConfig = () => {
    
    return new Promise((resolve) => {
      const query = () => {
        getUserConfig()
        .then(res => {
          if ((!res.data || res.data.actions !== 1) && getCount++ < 10) {
            setTimeout(() => {
              query()
            }, 5000)
          } else {
            resolve(res)
          }
        })
      }
      query()
    })
    
  }

  const [verifying, setVerifying] = useState(false)

  const startVerification = async () => {
    setVerifying(true)
    const res = await riskApi.startVerification()
    // 认证中，则查询认证结果
    if (res?.data?.status === 1) {
      const resConfig = await startGetUserConfig()
      setVerifying(false)
      return resConfig
    } else {
      setVerifying(false)
      return res
    }
    
  }

  const riskStatus = useMemo(() => {
    if (!riskUserConfig) return RISK_STATUS.DEFAULT
    if (riskUserConfig.actions === -1) return RISK_STATUS.NOTSIGN
    if (riskUserConfig.actions === 1 || riskUserConfig.actions === 2 || riskUserConfig.actions === 3) return RISK_STATUS.VERIFIED
    if (riskUserConfig.blacklist) return RISK_STATUS.ISSUE
    return RISK_STATUS.NOTVERIFIED
  }, [riskUserConfig])
  
  return {
    riskStatus,
    verifying,
    startVerification
  }
}