import { baseApi } from "@/service/base/api"
import { useTokenBalances as useBalances, useChainId  } from './useCaCommon'
import { RESPONSE_CODE } from '@/config/constants'
import { useEffect, useMemo } from 'react'
import { useActiveWeb3 } from './useActiveWe3'
import { formatAmount } from '@/utils'
import { useBaseStore,  } from '@/stores/baseStore'
import type { ITokenWithBalance } from '@/service/base/types'

import { useTokens, useRwaTokens } from './useTokens'

export function useTokenBalances() {
  const { getTokenBalances } = useBalances()
  const chainId = useChainId()
  const { account } = useActiveWeb3()
  const tokenList = useTokens()
  const rwaRwaList = useRwaTokens()
  const setTokenWithBalance = useBaseStore(state => state.setTokenWithBalance)

  const getTokensData = async (chainId: number, account: `0x${string}`, tokenList: Array<IToken | IRwaToken>) => {
    // const res = await baseApi.getTokens(chainId)
    // if (res.code === RESPONSE_CODE.SUCCESS) {
    //   const tokenList = (res.data || []);
    //   const balancesRes = await getTokenBalances(account, tokenList.map(token => token.address as `0x${string}`))
    //   const tokenListWithBalances = tokenList.map((token, index) => {
    //     return {
    //       ...token,
    //       origin: String(balancesRes[index].balance),
    //       balance: formatAmount(String(balancesRes[index].balance), 6, token.precision)
    //     }
    //   })
    //   baseStore.setTokens(tokenListWithBalances)
    // }
    const balancesRes = await getTokenBalances(account, tokenList.map(token => token.address as `0x${string}`))
    const tokenWithBalance = balancesRes.reduce((acc, cur, index) => {
      acc[tokenList[index].address] = {
        origin: String(cur.balance),
        balance: formatAmount(String(cur.balance), 6, tokenList[index].precision)
      }
      return acc
    }, {} as Record<string, ITokenWithBalance>)
    setTokenWithBalance(tokenWithBalance)
  }

  useEffect(() => {
    if (chainId && account) {
      getTokensData(chainId, account, [...tokenList, ...rwaRwaList])
    }
  }, [chainId, account, tokenList, rwaRwaList])
}
