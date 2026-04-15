import {
  useTokenBalances as useBalances,
  useChainId,
} from './useCaCommon'
import { useCallback, useEffect, useMemo } from 'react'
import { useActiveWeb3 } from './useActiveWe3'
import { formatAmount, symbolToLower } from '@/utils'
import { useBaseStore } from '@/stores/baseStore'
import type { IToken, ITokenWithBalance } from '@/service/base/types'

import { useTokens, useRwaTokens } from './useTokens'
import { useWssStore } from '@/stores/wssStore'

export function useTokenBalances() {
  const { getTokenBalances } = useBalances()
  const chainId = useChainId()
  const { account } = useActiveWeb3()
  const tokenList = useTokens()
  const rwaRwaList = useRwaTokens()
  const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)
  const setTokenWithBalance = useBaseStore(state => state.setTokenWithBalance)
  const freshTokenBalancesCount = useBaseStore(state => state.freshTokenBalancesCount)

  const getTokensData = async (account: `0x${string}`, tokenList: Array<IToken | IToken>) => {
    const balancesRes = await getTokenBalances(
      account,
      tokenList.map(token => token.address as `0x${string}`)
    )

    const tokenWithBalance = balancesRes.reduce(
      (acc, cur, index) => {
        acc[symbolToLower(tokenList[index].symbol)] = {
          origin: String(cur.balance),
          balance: formatAmount(String(cur.balance), tokenList[index].decimals, tokenList[index].precision),
        }
        return acc
      },
      {} as Record<string, ITokenWithBalance>
    )

    setTokenWithBalance(tokenWithBalance)
  }
  const getTokensDataByStockId = useCallback(async (account: `0x${string}`, stockIds: number[]) => {
    const newTokenWithBalance = Object.entries(tokenWithBalance).reduce<
      Record<string, ITokenWithBalance>
    >((acc, [key, token]) => {
      acc[key] = token
      return acc
    }, {})
    // 先通过stockId找到对应的token地址
    const stockIdToTokenMap: Record<number, IToken> = {}
    if (rwaRwaList.length > 0) {
      // 生成一条全新的 rwaRwaList, 后面要更新它，然后再setTokenWithBalance
      let newRwaList = rwaRwaList.map(rwa => ({...rwa}))

      newRwaList.forEach(token => {
        if (token.stockId) {
          stockIdToTokenMap[token.stockId] = token
        }
      })

      const tokensToFetch = stockIds.map(stockId => stockIdToTokenMap[stockId]).filter(Boolean)
      const balancesRes = await getTokenBalances(
        account,
        tokensToFetch.map(token => token.address as `0x${string}`)
      )
      balancesRes.forEach((balance, index) => {
        const token = tokensToFetch[index]
        // 更新tokenWithBalance中对应的token余额信息
        const tokenKey = symbolToLower(token.symbol)
        newTokenWithBalance[tokenKey] = {
          origin: String(balance.balance),
          balance: formatAmount(String(balance.balance), token.decimals, token.precision),
        }
      })
    }
    // 处理稳定币余额获取更新
    if (tokenList.length > 0) {
      const balancesRes = await getTokenBalances(
        account,
        tokenList.map(token => token.address as `0x${string}`)
      )

      balancesRes.forEach((balance, index) => {
        const token = tokenList[index]
        // 更新tokenWithBalance中对应的token余额信息
        const tokenKey = symbolToLower(token.symbol)
        newTokenWithBalance[tokenKey] = {
          origin: String(balance.balance),
          balance: formatAmount(String(balance.balance), token.decimals, token.precision),
        }
      })
      
    }

    setTokenWithBalance(newTokenWithBalance)
  }, [tokenList, rwaRwaList, tokenWithBalance, setTokenWithBalance])

  const refreshTokenBalances = useCallback(() => {
    if (account && tokenList && rwaRwaList) {
      // @ts-ignore
      getTokensData(account, [...tokenList, ...rwaRwaList])
    }
  }, [account, tokenList, rwaRwaList])

  useEffect(() => {
    if (chainId && account && tokenList.length > 0 && rwaRwaList.length > 0) {

      // @ts-ignore
      getTokensData(account, [...tokenList, ...rwaRwaList])
    }
  }, [chainId, account, tokenList.length, rwaRwaList.length, freshTokenBalancesCount])

  return {
    getTokensDataByStockId: getTokensDataByStockId,
    refreshTokenBalances: refreshTokenBalances,
  }
}

export function useGetTokenBalances() {
  const { getTokenBalances } = useBalances()
  const { account } = useActiveWeb3()
  const tokenList = useTokens()
  const rwaRwaList = useRwaTokens()
  const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)
  const setTokenWithBalance = useBaseStore(state => state.setTokenWithBalance)
  
  const getTokensDataByStockId = useCallback(async (stockIds: number[]) => {
    const newTokenWithBalance = Object.entries(tokenWithBalance).reduce<
      Record<string, ITokenWithBalance>
    >((acc, [key, token]) => {
      acc[key] = token
      return acc
    }, {})
    if (!account) return
    // 先通过stockId找到对应的token地址
    const stockIdToTokenMap: Record<number, IToken> = {}
    if (rwaRwaList.length > 0) {
      // 生成一条全新的 rwaRwaList, 后面要更新它，然后再setTokenWithBalance
      let newRwaList = rwaRwaList.map(rwa => ({...rwa}))

      newRwaList.forEach(token => {
        if (token.stockId) {
          stockIdToTokenMap[token.stockId] = token
        }
      })

      const tokensToFetch = stockIds.map(stockId => stockIdToTokenMap[stockId]).filter(Boolean)
      const balancesRes = await getTokenBalances(
        account as `0x${string}`,
        tokensToFetch.map(token => token.address as `0x${string}`)
      )
      balancesRes.forEach((balance, index) => {
        const token = tokensToFetch[index]
        // 更新tokenWithBalance中对应的token余额信息
        const tokenKey = symbolToLower(token.symbol)
        newTokenWithBalance[tokenKey] = {
          origin: String(balance.balance),
          balance: formatAmount(String(balance.balance), token.decimals, token.precision),
        }
      })
    }
    // 处理稳定币余额获取更新
    if (tokenList.length > 0) {
      const balancesRes = await getTokenBalances(
        account as `0x${string}`,
        tokenList.map(token => token.address as `0x${string}`)
      )

      balancesRes.forEach((balance, index) => {
        const token = tokenList[index]
        // 更新tokenWithBalance中对应的token余额信息
        const tokenKey = symbolToLower(token.symbol)
        newTokenWithBalance[tokenKey] = {
          origin: String(balance.balance),
          balance: formatAmount(String(balance.balance), token.decimals, token.precision),
        }
      })
      
    }

    setTokenWithBalance(newTokenWithBalance)
  }, [account, tokenList, rwaRwaList, tokenWithBalance, setTokenWithBalance])


  return {
    getTokensDataByStockId,
  }
}

export const useTokenBalance = (symbol: string) =>
  useBaseStore(state => state.tokenWithBalance[symbolToLower(symbol)])

export const useRwaPrice = (symbol: string) =>
  useBaseStore(state => state.tokenWithPrice[symbolToLower(symbol)])

export const useStableRwaPrice = (symbol: string) =>
  useWssStore(state => state.stableTokenWithPrice[symbolToLower(symbol)])
