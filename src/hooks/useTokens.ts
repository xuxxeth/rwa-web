import { useEffect, useMemo } from 'react'
import { useChainId } from './useCaCommon'
import { useBaseStore } from '@/stores/baseStore'

// 获取原生的 rwa 列表
export function useRwaTokens(includeDelisted: boolean = true) {
  // TODO: rwaList 就是根据 chainId 获取来的，还需要过滤吗？感觉不太需要了？
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
  const chainId = useChainId()
  return useMemo(() => {
    if (chainId && tokenList) {
      return tokenList.filter(token => token.chainId === chainId)
    }
    return []
  }, [chainId, tokenList])
}

export function useUSDT() {
  const tokens = useTokens()
  return useMemo(() => {
    return tokens.find(token => token.symbol === 'USDT')
  }, [tokens])
}
