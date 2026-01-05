import { useSignature } from '@/hooks/useCaCommon'
import storage from '@/utils/storage'
import { useCallback, useEffect, useState } from 'react'
import { useActiveWeb3 } from './useActiveWe3'
import { useTradeStore } from '@/stores/tradeStore'
import { SIGNATURE_EXPIRES } from '@/config/constants'
import { CONNECT_ACCOUNT } from '../config/constants'

export function useRequestSignature() {
  const [signing, setSigning] = useState(false)
  const { account } = useActiveWeb3()
  const { requestSignature } = useSignature()

  const signature = useCallback(async () => {
    setSigning(true)
    try {
      const res = await requestSignature(Math.floor(Date.now() / 1000) + SIGNATURE_EXPIRES)
      storage.setItem(`signature_${res.account?.toLowerCase()}`, res)
      setSigning(false)
      return res
    } catch (error) {
      setSigning(false)
      return null
    }

  }, [signing, requestSignature])

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
    signing,
    signature,
    validSignature,
  }
}

export function useSignatureValidStatus(): [boolean, (isValid?: boolean) => void] {
  const { validSignature } = useRequestSignature()
  const isSignatureValid = useTradeStore(state => state.isSignatureValid)
  const setIsSignatureValid = useTradeStore(state => state.setIsSignatureValid)

  const { account, chainId } = useActiveWeb3()
  useEffect(() => {
    setIsSignatureValid(!!validSignature())
  }, [account, chainId])

  const refreshIsSignatureValid = (isValid?: boolean) => {
    if (isValid !== undefined) {
      setIsSignatureValid(isValid)
    } else {
      setIsSignatureValid(!!validSignature())
    }
  }

  return [isSignatureValid, refreshIsSignatureValid]
}
