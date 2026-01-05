import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils'
import { useRequestSignature } from '@/hooks/useSignature'
import { Button } from '../ui/button'
import { useKycStore } from '@/stores/kycStore'
import { useState } from 'react'

function SignButton(props: { className?: string; refreshIsSignatureValid?: () => void }) {
  const { className, refreshIsSignatureValid } = props
  const { t } = useTranslation()
  const { signing, signature } = useRequestSignature()
  const [loading, setLoading] = useState(false)
  const getUserConfig = useKycStore(state => state.getUserConfig)

  const handleSignatureVerify = async () => {
    setLoading(true)
    await signature()
    refreshIsSignatureValid && refreshIsSignatureValid()
    await getUserConfig()
    setLoading(false)
  }
  return (
    <Button
      disabled={signing || loading}
      onClick={handleSignatureVerify}
      className={cn('bg-white text-black w-[148px] h-[32px] rounded-[8px] text-[12px]', className)}
    >
      {t('gotoSignature')}
    </Button>
  )
}

export default SignButton
