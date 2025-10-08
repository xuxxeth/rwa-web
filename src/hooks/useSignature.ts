import { useSignature } from '@/hooks/useCaCommon'
import storage from '@/utils/storage'
import { useCallback } from 'react'
import { useActiveWeb3 } from './useActiveWe3'

export function useRequestSignature() {
  const { account } = useActiveWeb3()
  const { requestSignature } = useSignature()

  const signature = useCallback(async () => {
    const res = await requestSignature(Math.floor(Date.now() / 1000 + 100 * 60))
    storage.setItem(`signature_${res.account?.toLowerCase()}`, res)
    return res
  }, [requestSignature])

  const validSignature = useCallback(async () => {
    const localSignature = account ? storage.getItem(`signature_${account?.toLowerCase()}`) : null
    return account && localSignature && (localSignature.account?.toLowerCase() === account.toLowerCase()) && (localSignature.expires > Math.floor(Date.now() / 1000))
  }, [account])

  return {
    signature,
    validSignature
  }

}