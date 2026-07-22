import { baseApi } from "@/service/base/api"
import { useTokenBalances as useBalances, useChainId, useIsSupportChain  } from './useCaCommon'
import { RESPONSE_CODE } from '@/config/constants'
import { useEffect, useMemo } from 'react'
import { useActiveWeb3 } from './useActiveWe3'
import { formatAmount } from '@/utils'
import { useBaseStore } from '@/stores/baseStore'

export function useRwaBalances() {
  const { getTokenBalances } = useBalances()
  const chainId = useChainId()
  const { account } = useActiveWeb3()
  const baseStore = useBaseStore()
  const isSupportChain = useIsSupportChain()

  const getRwaData = async (chainId: number, account: `0x${string}`) => {
    const res = await baseApi.getBaseRwas(chainId)
    if (res.code === RESPONSE_CODE.SUCCESS) {
      const rwaList = (res.data || []);
      const balancesRes = await getTokenBalances(account, rwaList.map(token => token.address as `0x${string}`))
      const rwaListWithBalances = rwaList.map((token, index) => {
        return {
          ...token,
          origin: String(balancesRes[index].balance),
          balance: formatAmount(String(balancesRes[index].balance), 6, token.precision),
          price: '0',
          up: "0", 
          lock: 0 
        }
      })
      baseStore.setRwas(rwaListWithBalances)
    }
  }

  useEffect(() => {
    if (chainId && account && isSupportChain) {
      getRwaData(chainId, account as `0x${string}`)
    }
  }, [chainId, account, isSupportChain])

}

export function useRwas() {
  const rwaList = useBaseStore(state => state.rwaList)
  
  return rwaList
}

export function useRwaByStockId(stockId?: number) {
  const rwaList = useBaseStore(state => state.rwaList)
  return useMemo(() => {
    return rwaList.find(token => token.stockId === stockId)
  }, [rwaList])
}