import { useBaseStore } from '@/stores/baseStore'
import { useAppStore } from '@/stores/appStore'
import { useMemo } from 'react'

export function useContractAddr() {
  const chainList = useBaseStore(state => state.chainList)
  const currentChainId = useAppStore(state => state.currentChainId)

  return useMemo(() => {
    if (!currentChainId) return null
    const chain = chainList.find(item => item.id === currentChainId)
    return chain?.contract ?? null
  }, [currentChainId, chainList])
}
