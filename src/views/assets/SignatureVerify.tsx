import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/utils'
import { useRequestSignature } from '@/hooks/useSignature'

function SignatureVerify(props: { className?: string; refreshIsSignatureValid: () => void }) {
  const { className, refreshIsSignatureValid } = props
  const { t } = useTranslation()
  const { signature } = useRequestSignature()

  const handleSignatureVerify = async () => {
    await signature()
    refreshIsSignatureValid()
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div>
        <LazyImage className='w-[50px] h-[60px]' src='/images/icons/assets/security.png' alt='' />
      </div>
      <div className='text-sm mt-4 text-[24px] font-semibold'>{t('signatureVerify')}</div>
      <div className=' mt-4 text-60 text-base font-normal text-center'>
        <div className='w-[450px] m-auto'>{t('signatureVerifyDescTop')}</div>
        <div className='w-[350px] m-auto'>{t('signatureVerifyDescBottom')}</div>
      </div>
      <button
        onClick={handleSignatureVerify}
        className='w-[314px] cursor-pointer bg-white rounded-[16px] text-base/6 py-4 mt-9  font-semibold text-black'
      >
        {t('gotoSignature')}
      </button>
    </div>
  )
}

export default SignatureVerify
