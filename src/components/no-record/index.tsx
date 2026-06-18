import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation, Trans } from '@/hooks/useTranslation'
import { cn } from '@/utils'

function NoRecord(props: { className?: string }) {
  const { t } = useTranslation()
  return (
    <div className={cn('mt-10', props.className)}>
      <LazyImage src='/images/v2/portfolio/no-record.svg' className='w-[88px] m-auto' />
      <div className='text-center text-sm/4.5 font-normal mt-4 text-gray-400'>{t('noRecord')}</div>
    </div>
  )
}

export function NoRecordAndSeeMore(props: {
  moreLang: string
  onClick: () => void
  showIcon: boolean
}) {
  return (
    <div className={props.showIcon ? 'mt-10' : ''}>
      {props.showIcon && (
        <LazyImage src='/images/v2/portfolio/no-record.svg' className='w-[88px] m-auto' />
      )}
      <div
        className={cn(
          'text-center text-sm/4.5 font-normal text-gray-400',
          props.showIcon ? 'mt-4' : 'mt-2'
        )}
      >
        <Trans
          i18nKey={props.moreLang}
          components={{
            1: <span className='text-blue-50 cursor-pointer' onClick={props.onClick} />,
          }}
        />
      </div>
    </div>
  )
}

export default NoRecord
