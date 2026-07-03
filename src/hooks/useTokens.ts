import { useEffect, useMemo } from 'react'
import { useBaseStore } from '@/stores/baseStore'
import { useAppStore } from '@/stores/appStore'
import { type IStock } from '@/service/base/types'

export function useStockList(includeDelisted: boolean = false) {
  const stockList = useBaseStore(state => state.stocksList)
  if (includeDelisted) return stockList
  return stockList.filter(stock => stock.listingState !== 0)
}

export function useStockMap(includeDelisted: boolean = false) {
  const stockList = useStockList(includeDelisted)
  return useMemo(() => {
    return stockList.reduce(
      (acc, stock) => {
        acc[stock.id] = stock
        return acc
      },
      {} as Record<string, IStock>
    )
  }, [stockList])
}

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
