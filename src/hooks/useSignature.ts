import { useSignature } from '@/hooks/useCaCommon'
import storage from '@/utils/storage'
import { useCallback, useState } from 'react'
import { useActiveWeb3 } from './useActiveWe3'

export function useRequestSignature() {
  const { account } = useActiveWeb3()
  const { requestSignature } = useSignature()

  const signature = useCallback(async () => {
    const res = await requestSignature(Math.floor(Date.now() / 1000 + 100 * 60))
    storage.setItem(`signature_${res.account?.toLowerCase()}`, res)
    return res
  }, [requestSignature])

  // 浏览器原生的 localStorage API 是同步的? 所以这里不需要 async await
  const validSignature = useCallback(() => {
    const localSignature = account ? storage.getItem(`signature_${account?.toLowerCase()}`) : null
    return (
      account &&
      localSignature &&
      localSignature.account?.toLowerCase() === account.toLowerCase() &&
      localSignature.expires > Math.floor(Date.now() / 1000)
    )
  }, [account])

  return {
    signature,
    validSignature,
  }
}

export function useSignatureValidStatus(): [boolean, (isValid?: boolean) => void] {
  const { validSignature } = useRequestSignature()
  const [isSignatureValid, setIsSignatureValid] = useState(!!validSignature())

  const refreshIsSignatureValid = (isValid?: boolean) => {
    if (isValid !== undefined) {
      setIsSignatureValid(isValid)
    } else {
      setIsSignatureValid(!!validSignature())
    }
  }

  return [isSignatureValid, refreshIsSignatureValid]
}
