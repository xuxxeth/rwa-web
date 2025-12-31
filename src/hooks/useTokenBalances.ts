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
    refreshTokenBalances: refreshTokenBalances,
  }
}

export const useTokenBalance = (symbol: string) =>
  useBaseStore(state => state.tokenWithBalance[symbolToLower(symbol)])

export const useRwaPrice = (symbol: string) =>
  useBaseStore(state => state.tokenWithPrice[symbolToLower(symbol)])

export const useStableRwaPrice = (symbol: string) =>
  useWssStore(state => state.stableTokenWithPrice[symbolToLower(symbol)])
