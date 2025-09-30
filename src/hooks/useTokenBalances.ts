import { baseApi } from '@/service/baseApi'
import { useTokenBalances as useBalances, useChainId  } from './useCaCommon'
import { RESPONSE_CODE } from '@/config/constants'
import { useEffect, useMemo } from 'react'
import { useActiveWeb3 } from './useActiveWe3'
import { formatAmount } from '@/utils'
import { useBaseStore } from '@/stores/baseStore'

export function useTokenBalances() {
  const { getTokenBalances } = useBalances()
  const chainId = useChainId()
  const { account } = useActiveWeb3()
  const baseStore = useBaseStore()

  const getTokensData = async (chainId: number, account: `0x${string}`) => {
    const res = await baseApi.getTokens(chainId)
    if (res.code === RESPONSE_CODE.SUCCESS) {
      const tokenList = (res.data || []);
      const balancesRes = await getTokenBalances(account, tokenList.map(token => token.address as `0x${string}`))
      const tokenListWithBalances = tokenList.map((token, index) => {
        return {
          ...token,
          origin: String(balancesRes[index].balance),
          balance: formatAmount(String(balancesRes[index].balance), 6, token.precision)
        }
      })
      baseStore.setTokens(tokenListWithBalances)
    }
  }

  useEffect(() => {
    if (chainId && account) {
      getTokensData(chainId, account)
    }
  }, [chainId, account])
}
