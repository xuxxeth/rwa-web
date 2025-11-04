import { RISK_STATUS } from "@/config/constants";
import { useRiskStore } from "@/stores/riskStore";
import { useEffect, useMemo, useState } from "react";
import { useActiveWeb3 } from "./useActiveWe3";
import { riskApi } from "@/service/risk/api";
import { useTradeStore } from "@/stores/tradeStore";

export function useRiskUserConfig() {
  const { chainId, account } = useActiveWeb3()  
  const getUserConfig = useRiskStore(state => state.getUserConfig)
  const isSignatureValid = useTradeStore(state => state.isSignatureValid)
  useEffect(() => {
    if (chainId && account || isSignatureValid) {
      getUserConfig()
    }
  }, [chainId, account, isSignatureValid])
}

export function useRiskStatus() {
  const riskUserConfig = useRiskStore(state => state.riskUserConfig)
  const getUserConfig = useRiskStore(state => state.getUserConfig)
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
    if (riskUserConfig.actions === 1) return RISK_STATUS.VERIFIED
    if (riskUserConfig.blacklist) return RISK_STATUS.ISSUE
    return RISK_STATUS.NOTVERIFIED
  }, [riskUserConfig])
  
  return {
    riskStatus,
    verifying,
    startVerification
  }
}