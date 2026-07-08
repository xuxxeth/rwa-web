// import { useTokenBalances as useBalances, useChainId, useIsSupportChain } from './useCaCommon'
import { useTokenBalancesV2 as useBalancesV2 } from 'ca-common-web'
import { useCallback, useEffect, useMemo } from 'react'
import { useActiveWeb3 } from './useActiveWe3'
import { formatAmount, symbolToLower } from '@/utils'
import { useBaseStore } from '@/stores/baseStore'
import type { IToken, IRwa, ITokenWithBalance } from '@/service/base/types'

import { useTokens, useRwaTokens } from './useTokens'
import { useWssStore } from '@/stores/wssStore'
import { useAppStore } from '@/stores/appStore'
import { useContractAddr } from '@/hooks/useContractAddr'

export function useTokenBalances() {
  const { getTokenBalances } = useBalancesV2()
  const chainList = useBaseStore(state => state.chainList)

  const currentChainId = useAppStore(state => state.currentChainId)

  const { account } = useActiveWeb3()
  const rwaList = useRwaTokens()
  const tokenList = useTokens()

  const setTokenWithBalance = useBaseStore(state => state.setTokenWithBalance)
  const freshTokenBalancesCount = useBaseStore(state => state.freshTokenBalancesCount)

  const getTokensData = async (
    diamondAddr: `0x${string}`,
    account: `0x${string}`,
    chainId: number,
    tokenList: Array<IToken | IRwa>
  ) => {
    if (tokenList[0].chainId !== chainId) {
      return
    }

    const balancesRes = await getTokenBalances(
      diamondAddr,
      account,
      tokenList.map(token => token.address as `0x${string}`)
    )

    const tokenWithBalance = balancesRes.reduce(
      (acc, cur, index) => {
        acc[symbolToLower(tokenList[index].symbol)] = {
          origin: String(cur.balance),
          balance: formatAmount(
            String(cur.balance),
            tokenList[index].decimals,
            tokenList[index].precision
          ),
        }
        return acc
      },
      {} as Record<string, ITokenWithBalance>
    )

    setTokenWithBalance(tokenWithBalance)
  }

  const refreshTokenBalances = useCallback(() => {
    const filteredTokenList = tokenList.filter(token => token.chainId === currentChainId)
    const filteredRwaList = rwaList.filter(rwa => rwa.chainId === currentChainId)
    const tokensToFetch = [...filteredTokenList, ...filteredRwaList]
    if (currentChainId && tokensToFetch.length > 0 && account) {
      const chain = chainList.find(item => item.id === currentChainId)
      const diamondAddr = chain?.contract ?? null
      if (!diamondAddr) return
      // @ts-ignore
      getTokensData(
        diamondAddr as `0x${string}`,
        account as `0x${string}`,
        currentChainId,
        tokensToFetch
      )
    }
  }, [currentChainId, account, rwaList, tokenList])

  useEffect(() => {
    refreshTokenBalances()
  }, [refreshTokenBalances, freshTokenBalancesCount])

  return {
    refreshTokenBalances: refreshTokenBalances,
  }
}

export function useGetTokenBalances() {
  const { getTokenBalances } = useBalancesV2()
  const { account } = useActiveWeb3()
  const contractAddr = useContractAddr() as `0x${string}` | null
  const tokenList = useTokens()
  const rwaRwaList = useRwaTokens()
  const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)
  const setTokenWithBalance = useBaseStore(state => state.setTokenWithBalance)

  const getTokensDataByStockId = useCallback(
    async (stockIds: number[], chainId?: number) => {
      const newTokenWithBalance = Object.entries(tokenWithBalance).reduce<
        Record<string, ITokenWithBalance>
      >((acc, [key, token]) => {
        acc[key] = token
        return acc
      }, {})
      if (!account || !contractAddr) return
      // 先通过stockId找到对应的token地址
      const stockIdToTokenMap: Record<number, IToken> = {}
      const filteredRwaList = rwaRwaList.filter(rwa => rwa.chainId === chainId)
      if (filteredRwaList.length > 0) {
        // 生成一条全新的 rwaRwaList, 后面要更新它，然后再setTokenWithBalance
        let newRwaList = filteredRwaList.map(rwa => ({ ...rwa }))

        newRwaList.forEach(token => {
          if (token.stockId) {
            stockIdToTokenMap[token.stockId] = token
          }
        })

        const tokensToFetch = stockIds.map(stockId => stockIdToTokenMap[stockId]).filter(Boolean)
        const balancesRes = await getTokenBalances(
          contractAddr,
          account as `0x${string}`,
          tokensToFetch.map(token => token.address as `0x${string}`)
        )
        // const balancesRes: any[] = []
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
      const filteredTokenList = tokenList.filter(token => token.chainId === chainId)
      if (filteredTokenList.length > 0) {
        const balancesRes = await getTokenBalances(
          // '0x00000000000000000000000000000000',
          contractAddr,
          account as `0x${string}`,
          filteredTokenList.map(token => token.address as `0x${string}`)
        )
        // const balancesRes: any[] = []

        balancesRes.forEach((balance, index) => {
          const token = filteredTokenList[index]
          // 更新tokenWithBalance中对应的token余额信息
          const tokenKey = symbolToLower(token.symbol)
          newTokenWithBalance[tokenKey] = {
            origin: String(balance.balance),
            balance: formatAmount(String(balance.balance), token.decimals, token.precision),
          }
        })
      }

      setTokenWithBalance(newTokenWithBalance)
    },
    [account, tokenList, rwaRwaList, tokenWithBalance, contractAddr, setTokenWithBalance]
  )

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
