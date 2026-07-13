import { useEffect, useMemo, useState } from 'react'
import type { IRwa, IToken } from '@/service/base/types'

type UseTradePageReadyParams = {
  account?: string
  inputToken?: IRwa | null
  outputToken?: IToken | null
  inputTokenBalance?: { balance?: string } | null
  outputTokenBalance?: { balance?: string } | null
  approvalState?: number
  riskStatus?: number
  isSignatureValid?: boolean
}

export function useTradePageReady({
  account,
  inputToken,
  outputToken,
  inputTokenBalance,
  outputTokenBalance,
  approvalState,
  riskStatus,
  isSignatureValid
}: UseTradePageReadyParams) {
  const [isPageReady, setIsPageReady] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setIsPageReady(true)
    }, 1500);

  }, [ ])

  return isPageReady
}
