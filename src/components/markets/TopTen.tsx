import { cn } from '@/lib/utils'
import type { IToptenshareholder } from '@/service/base/types'
import { memo } from 'react'
import { ProfileTitle } from './ProfileTitle'
import { formatLargeNumber, toFixed } from '@/utils/format'
import { useTranslation } from '@/hooks/useTranslation'

const TopHeader = () => {
  const { t } = useTranslation()
  return (
    <div className='flex items-center h-[44px] text-gray-400 text-sm/4.5 font-normal gap-x-4 px-4 py-2'>
      <div className='flex-1'>{t('companyProfile.h1')}</div>
      <div className='w-[185px] text-right'>{t('companyProfile.h2')}</div>
      <div className='w-[94px] text-right'>{t('companyProfile.h3')}</div>
      <div className='w-[213px] text-right'>{t('companyProfile.h4')}</div>
    </div>
  )
}

const TopItem = ({ top, className }: { top: IToptenshareholder; className?: string }) => {
  return (
    <div
      className={cn(
        'flex items-center h-[35px] text-white  text-sm/4.5 font-normal gap-x-4 px-4 py-2',
        className
      )}
    >
      <div className='flex-1'>{top.investor}</div>
      <div className='w-[185px] text-right'>{formatLargeNumber(top.heldSharesVolume)}</div>
      <div className='w-[94px] text-right'>{toFixed(top.proportion)}%</div>
      <div className='w-[213px] text-right'>{formatLargeNumber(top.shareHoldingChange)}</div>
    </div>
  )
}

const TopTen = memo(({ topTen }: { topTen: IToptenshareholder[] }) => {
  const { t } = useTranslation()

  return (
    <div>
      <div className='text-sm/5 font-normal mb-2'>{t('companyProfile.top10')}</div>
      <div className='border border-gray-850'>
        <TopHeader />
        {topTen.map((top, index) => {
          return (
            <TopItem
              key={top.investor}
              top={top}
              className={`${index % 2 === 0 ? 'bg-gray-850' : ''}`}
            />
          )
        })}
      </div>
    </div>
  )
})

export { TopTen }
