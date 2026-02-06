import { useEffect, useMemo } from 'react'
import { useBaseStore } from '@/stores/baseStore'

// 获取原生的 rwa 列表
export function useRwaTokens(includeDelisted: boolean = true) {
  const rwaList = useBaseStore(state => state.rwaList)

  return useMemo(() => {
    if (includeDelisted) {
      return rwaList
    }
    return rwaList.filter(rwa => rwa.state !== 2)
  }, [rwaList, includeDelisted])
}

// 获取原生的 token 列表
export function useTokens() {
  const tokenList = useBaseStore(state => state.tokenList)
  const currentChain = useBaseStore(state => state.currentChain)
  return useMemo(() => {
    if (currentChain && tokenList) {
      return tokenList.filter(token => token.chainId === currentChain.id)
    }
    return []
  }, [currentChain, tokenList])
}

export function useUSDT() {
  const tokens = useTokens()
  return useMemo(() => {
    return tokens.find(token => token.symbol === 'USDT')
  }, [tokens])
}
