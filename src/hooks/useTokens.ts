import { useEffect, useMemo } from 'react'
import { useBaseStore } from '@/stores/baseStore'
import { useAppStore } from '@/stores/appStore'

// 获取原生的 rwa 列表
export function useRwaTokens(includeDelisted: boolean = true) {
  const rwaList = useBaseStore(state => state.rwaList)
  const currentChainId = useAppStore(state => state.currentChainId)

  return useMemo(() => {
    if (includeDelisted) {
      return rwaList
    }
    return rwaList.filter(rwa => rwa.state !== 2 && rwa.chainId === currentChainId)
  }, [rwaList, includeDelisted, currentChainId])
}

// 获取原生的 token 列表
export function useTokens() {
  const tokenList = useBaseStore(state => state.tokenList)
  const currentChainId = useAppStore(state => state.currentChainId)
  return useMemo(() => {
    if (currentChainId && tokenList) {
      return tokenList.filter(token => token.chainId === currentChainId)
    }
    return []
  }, [currentChainId, tokenList])
}

export function useUSDT() {
  const tokens = useTokens()
  return useMemo(() => {
    return tokens.find(token => token.symbol === 'USDT')
  }, [tokens])
}
