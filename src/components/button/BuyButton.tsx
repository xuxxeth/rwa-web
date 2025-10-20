import ArrowRight2SVG from './arrow-right2.svg?react'
import { noop } from '@/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from '@/hooks/useRouter'
import { useTradeStore } from '@/stores/tradeStore'
import type { IRwa } from '@/service/base/types'

export default function BuyButton(props: { rwa: IRwa }) {
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
