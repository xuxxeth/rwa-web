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
  t,
}: UseTradeGateStateParams) {
  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()
  const { riskStatus } = useRiskStatus()

  const kycButtonText = useMemo(() => {
    if (riskStatus !== RISK_STATUS.VERIFIED && riskStatus !== RISK_STATUS.DEFAULT) {
      return t('identity.verifyID')
    }
    return ''
  }, [riskStatus, t])

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
