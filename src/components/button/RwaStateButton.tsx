import { LazyImage } from '@/components/image/LazyImage'
import ArrowRight2SVG from './arrow-right2.svg?react'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from '@/hooks/useRouter'
import { useTradeStore } from '@/stores/tradeStore'
import type { IRwa, IRwaState } from '@/service/base/types'
import { symbolToLower, cn } from '@/utils'

export default function RwaStateButton({ rwa, className }: { rwa: IRwa; className?: string }) {
  if (rwa.state === 1) {
    return <TradingHaltBtn className={className} />
  }
  return <BuyButton rwa={rwa} className={className} />
}

export function BuyButton({ rwa, className }: { rwa: IRwa; className?: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const updateInputToken = useTradeStore(state => state.updateInputToken)

  return (
    <button
      onClick={() => {
        updateInputToken(rwa)
        router.push('/trade/' + rwa.symbol)
      }}
      className={cn(
        'text-sm/4.5 flex flex-row hover:bg-green-50 text-green-50 hover:text-white items-center font-medium px-3 py-2  bg-[rgba(37,167,80,0.1)] rounded-[5px] cursor-pointer',
        className
      )}
    >
      <span>{t('Trade')}</span>
      <ArrowRight2SVG className='w-4 h-4 ml-2' />
    </button>
  )
}

export function TradingHaltBtn({ className }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <button
      className={
        'flex flex-row gap-2 items-center justify-center py-2 px-3 bg-[rgba(238,68,63,0.1)] rounded-[5px]'
      }
    >
      {/* <LazyImage
        className='w-4 h-4'
        src='/images/convert/lock.png'
        alt={t('marketQuotes.tradingHalt')}
      /> */}
      <span className={cn('text-sm/4.5 text-[rgba(238,68,63,1)] font-medium', className)}>
        {t('marketQuotes.tradingHalt')}
      </span>
    </button>
  )
}
