import { useMemo } from "react"
import { useSignatureValidStatus } from "@/hooks/useSignature"
import { useRiskStatus } from "@/hooks/useRiskStatus"
import { RISK_STATUS } from "@/config/constants"
import { useTradePageReady } from "@/hooks/useTradePageReady"
import type { IRwa, IToken } from "@/service/base/types"
import type { TFunction } from "i18next"

type TokenBalance = {
  balance?: string
}

interface UseTradeGateStateParams {
  account?: string
  isSameChain?: boolean
  inputToken?: IRwa | null
  outputToken?: IToken | null
  inputTokenBalance?: TokenBalance | null
  outputTokenBalance?: TokenBalance | null
  approvalState: number
  action: "buy" | "sell"
  riskUserConfig?: {
    actions?: number
  } | null
  t: TFunction
}

export function useTradeGateState({
  account,
  isSameChain,
  inputToken,
  outputToken,
  inputTokenBalance,
  outputTokenBalance,
  approvalState,
  action,
  riskUserConfig,
  t,
}: UseTradeGateStateParams) {
  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()
  const { riskStatus } = useRiskStatus()

  const kycButtonText = useMemo(() => {
    if (riskStatus === RISK_STATUS.ISSUE) {
      return t('issue')
    }
    if (riskStatus !== RISK_STATUS.VERIFIED && riskStatus !== RISK_STATUS.DEFAULT) {
      return t('identity.verifyID')
    }
    if (riskUserConfig?.actions === 0) {
      return t('identity.verifyID')
    }
    if (riskUserConfig?.actions === 1 && action === 'sell') {
      return t('kyc.t51')
    }
    if (riskUserConfig?.actions === 2 && action === 'buy') {
      return t('kyc.t51')
    }
    
    return ''
  }, [riskUserConfig, action, riskStatus, t])

  const isPageReady = useTradePageReady({
    account,
    isSameChain,
    inputToken,
    outputToken,
    inputTokenBalance,
    outputTokenBalance,
    approvalState,
    riskStatus,
    isSignatureValid,
  })

  return {
    isSignatureValid,
    refreshIsSignatureValid,
    riskStatus,
    kycButtonText,
    isPageReady,
  }
}
