import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils'
import { useRequestSignature } from '@/hooks/useSignature'
import { Button } from '../ui/button'
import { useKycStore } from '@/stores/kycStore'
import { useState } from 'react'

function SignButton(props: { className?: string; refreshIsSignatureValid?: () => void, label?: string, callback?: () => void }) {
  const { className, refreshIsSignatureValid, label, callback } = props
  const { t } = useTranslation()
  const { signing, signature } = useRequestSignature()
  const [loading, setLoading] = useState(false)
  const getUserConfig = useKycStore(state => state.getUserConfig)

  const handleSignatureVerify = async () => {
    setLoading(true)
    try {
      const res = await signature()
      refreshIsSignatureValid && refreshIsSignatureValid()
      await getUserConfig()
      res && callback && await callback()
    } catch (error) {
      console.error('Signature verification failed:', error)
    }
    
    setLoading(false)
  }
  return (
    <Button
      loading={signing || loading}
      disabled={signing || loading}
      onClick={handleSignatureVerify}
      className={cn('bg-white text-black w-[148px] h-[32px] rounded-[8px] text-[12px]', className)}
    >
      {label || t('gotoSignature')}
    </Button>
  )
}

export default SignButton
