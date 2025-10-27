import { LazyImage } from '@/components/image/LazyImage'
import ArrowRight2SVG from './arrow-right2.svg?react'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from '@/hooks/useRouter'
import { useTradeStore } from '@/stores/tradeStore'
import type { IRwa, IRwaState } from '@/service/base/types'
import { symbolToLower } from '@/utils'

export default function RwaStateButton({ rwa }: { rwa: IRwa }) {
  if (rwa.state === 1) {
    return <TradingHaltBtn />
  }
  return <BuyButton rwa={rwa} />
}

export function BuyButton({ rwa }: { rwa: IRwa }) {
  const { t } = useTranslation()
  const router = useRouter()
  const updateInputToken = useTradeStore(state => state.updateInputToken)

  return (
    <button
      onClick={() => {
        updateInputToken(rwa)
        router.push('/markets/trading/' + symbolToLower(rwa.symbol))
      }}
      className='flex flex-row hover:bg-[rgba(33,201,94,1)] text-[rgba(33,201,94,1)] hover:text-black items-center font-medium h-10 px-3 py-2  bg-[rgba(33,201,94,0.1)] rounded-[5px] cursor-pointer'
    >
      <span>{t('marketQuotes.buy')}</span>
      <ArrowRight2SVG className='w-4 h-4 ml-2' />
    </button>
  )
}

export function TradingHaltBtn() {
  const { t } = useTranslation()
  return (
    <button className='flex flex-row gap-2 items-center justify-center py-2 px-3 bg-[rgba(238,68,63,0.1)] rounded-[5px]'>
      <LazyImage
        className='w-4 h-4'
        src='/images/convert/lock.png'
        alt={t('marketQuotes.tradingHalt')}
      />
      <span className='text-xs/3.5 font-medium'>{t('marketQuotes.tradingHalt')}</span>
    </button>
  )
}
