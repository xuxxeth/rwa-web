import { LazyImage } from '@/components/image/LazyImage'
import ArrowRight2SVG from './arrow-right2.svg?react'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from '@/hooks/useRouter'
import { useTradeStore } from '@/stores/tradeStore'
import type { IRwa, IRwaState } from '@/service/base/types'

export default function RwaStateButton({ rwa }: { rwa: IRwa }) {
  if (rwa.state === 0) {
    return <BuyButton rwa={rwa} />
  }
  if (rwa.state === 3) {
    return <TradingHaltBtn rwaState={rwa.state} />
  }
  return <TradingHaltBtn rwaState={rwa.state} />
}

export function BuyButton(props: { rwa: IRwa }) {
  const { t } = useTranslation()
  const router = useRouter()
  const updateInputToken = useTradeStore(state => state.updateInputToken)

  return (
    <button
      onClick={() => {
        updateInputToken(props.rwa)
        router.push('/lite-trade')
      }}
      className='flex flex-row hover:bg-[rgba(33,201,94,1)] text-[rgba(33,201,94,1)] hover:text-black items-center font-medium h-10 px-3 py-2  bg-[rgba(33,201,94,0.1)] rounded-[5px] cursor-pointer'
    >
      <span>{t('marketQuotes.buy')}</span>
      <ArrowRight2SVG className='w-4 h-4 ml-2' />
    </button>
  )
}

export function TradingHaltBtn({ rwaState }: { rwaState: IRwaState }) {
  const { t } = useTranslation()
  return (
    <button className='flex flex-row gap-2 items-center justify-center py-2 px-3 bg-[rgba(238,68,63,0.1)] rounded-[5px]'>
      <LazyImage
        className='w-4 h-4'
        src='/images/convert/lock.png'
        alt={t('marketQuotes.tradingHalt')}
      />
      {rwaState === 3 && (
        <span className='text-xs/3.5 font-medium'>{t('marketQuotes.tradingHalt')}</span>
      )}
      {rwaState === 1 && (
        <span className='text-xs/3.5 font-medium'>{t('marketQuotes.buyForbidden')}</span>
      )}
      {rwaState === 2 && (
        <span className='text-xs/3.5 font-medium'>{t('marketQuotes.sellForbidden')}</span>
      )}
    </button>
  )
}
