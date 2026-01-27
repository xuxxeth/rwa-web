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
        <LazyImage className='w-[65px]' src='/images/v2/portfolio/security.png' alt='' />
      </div>
      <div className='text-sm mt-2 font-medium text-white'>{t('signatureVerify')}</div>
      <div className=' mt-2 text-xs text-base text-gray-400 font-normal text-center'>
        <div className='w-[450px] m-auto'>{t(desc)}</div>
        {subDesc && <div className='w-[350px] m-auto'>{t(subDesc)}</div>}
      </div>
      <button
        disabled={signing}
        onClick={handleSignatureVerify}
        className='cursor-pointer bg-white rounded-[8px] text-sm/4.5 py-2 px-6 mt-2  font-semibold text-black'
      >
        {t('gotoSignature')}
      </button>
    </div>
  )
}
