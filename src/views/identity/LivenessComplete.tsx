import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'

export default function LivenessComplete() {
  const { t } = useTranslation()

  return (
    <div>
      <div className='px-4 h-[56px] flex flex-row items-center justify-left gap-2'>
        <LazyImage className='w-7 h-7' src='/images/logo_white.png' />
        <LazyImage className='w-[145px] h-6' src='/images/logo_white_text.png' />
      </div>
      <div className='p-8'>
        <LazyImage
          src='/images/icons/identity/liveness-ok.png'
          className='w-[195px] h-[192px] m-auto'
        />
      </div>
      <div className='text-xl text-center text-white'>{t('identity.face.complete')}</div>
      <div className='mt-4 text-base text-center text-white'>{t('identity.face.toWeb')}</div>
    </div>
  )
}
