import { MainLayout } from '@/layouts/main'
import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'

export default function MarketQuoteError() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className='bg-[rgba(7,8,13,1)] min-h-[100vh] text-white '>
        <div className='flex flex-row mt-[133px] items-center justify-center'>
          <LazyImage
            src='/images/convert/market-quote-err.png'
            alt='market quote error'
            className='w-[380px] h-[136px]'
          />
        </div>
        <div className='text-center text-xl/9 mt-13.5 font-semibold'>
          {t('marketQuotes.networkError.title')}
        </div>
        <div className='text-center text-base/6 font-medium mt-2 text-60'>
          {t('marketQuotes.networkError.desc')}
        </div>
      </div>
    </MainLayout>
  )
}
