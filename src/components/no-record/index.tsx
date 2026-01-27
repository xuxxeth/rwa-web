import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'

function NoRecord() {
  const { t } = useTranslation()
  return (
    <div className='mt-10'>
      <LazyImage src='/images/v2/portfolio/no-record.svg' className='w-[88px] m-auto' />
      <div className='text-center text-sm/4.5 font-normal mt-4 text-gray-400'>{t('noRecord')}</div>
    </div>
  )
}

export default NoRecord
