import { useTranslation } from '@/hooks/useTranslation'
import { useRequestSignature } from '@/hooks/useSignature'
import { cn } from '@/utils'
import { LazyImage } from '@/components/image/LazyImage'

export default function SignatureVerify(props: {
  className?: string
  refreshIsSignatureValid: () => void
  desc: string
  subDesc?: string
}) {
  const { className, refreshIsSignatureValid, desc, subDesc } = props
  const { t } = useTranslation()
  const { signing, signature } = useRequestSignature()

  const handleSignatureVerify = async () => {
    await signature()
    refreshIsSignatureValid()
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div>
        <LazyImage className='w-[50px] h-[60px]' src='/images/icons/assets/security.png' alt='' />
      </div>
      <div className='text-sm mt-4 text-[24px] font-semibold text-white'>
        {t('signatureVerify')}
      </div>
      <div className=' mt-4 text-60 text-base font-normal text-center'>
        <div className='w-[450px] m-auto'>{t(desc)}</div>
        {subDesc && <div className='w-[350px] m-auto'>{t(subDesc)}</div>}
      </div>
      <button
        disabled={signing}
        onClick={handleSignatureVerify}
        className='w-[314px] cursor-pointer bg-white rounded-[16px] text-base/6 py-4 mt-9  font-semibold text-black'
      >
        {t('gotoSignature')}
      </button>
    </div>
  )
}
