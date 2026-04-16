import { useTranslation } from '@/hooks/useTranslation'
import { MARKET_STATUS } from '@/config/constants'
import NoRecord from '@/components/no-record'
import { WalletNotConnectedSmallVersion } from '@/components/wallet-not-connected'
import SignatureVerify from '@/components/signature-verify'
import { LazyImage } from '@/components/image/LazyImage'
import { cn, type Change, symbolToLower } from '@/utils'
import IconWithTooltip from '@/components/icon-tooltip'
import { useBaseStore } from '@/stores/baseStore'

export function TradeState({ state }: { state: number }) {
  switch (state) {
    case 1:
      return (
        <IconWithTooltip
          triggerClassName='ml-2 shrink-0'
          icon='/images/v2/icons/trade_halt.svg'
          tooltip={'marketQuotes.tH'}
        />
      )
    default:
      return null
  }
}

export function SessionType({ sessionMask }: { sessionMask: number }) {
  const preMarket = 1 << 1
  const afterMarket = 1 << 2
  const overnight = 1 << 3

  const { t } = useTranslation()
  const marketTradeState = useBaseStore(state => state.marketTradeState)

  switch (marketTradeState) {
    case MARKET_STATUS.BEFORE:
      if ((sessionMask & preMarket) === 0) {
        return (
          <IconWithTooltip
            triggerClassName='ml-2 shrink-0'
            icon='/images/v2/icons/session1.svg'
            tooltip={
              <span>{t('marketQuotes.noPreOrPost', { session: t('marketQuotes.preMarket') })}</span>
            }
          />
        )
      }
      break
    case MARKET_STATUS.AFTER:
      if ((sessionMask & afterMarket) === 0) {
        return (
          <IconWithTooltip
            triggerClassName='ml-2 shrink-0'
            icon='/images/v2/icons/session1.svg'
            tooltip={
              <span>
                {t('marketQuotes.noPreOrPost', { session: t('marketQuotes.afterMarket') })}
              </span>
            }
          />
        )
      }
      break
    case MARKET_STATUS.OVERNIGHT:
      if ((sessionMask & overnight) === 0) {
        return (
          <IconWithTooltip
            triggerClassName='ml-2 shrink-0'
            icon='/images/v2/icons/session2.svg'
            tooltip={<span>{t('marketQuotes.overnight')}</span>}
          />
        )
      }
      break
    default:
      return null
  }
}

export function NoDataReason(props: {
  isFavorites: boolean
  account?: string
  chainId: number | null
  isSignatureValid: boolean
  isWalletConnecting: boolean
  refreshIsSignatureValid: () => void
}) {
  if (!props.isFavorites) {
    return <NoRecord />
  }
  if (!props.account && props.isWalletConnecting) return null
  if (!props.account) return <WalletNotConnectedSmallVersion />
  if (!props.isSignatureValid)
    return (
      <SignatureVerify
        desc='signatureVerifyDescTop'
        subDesc='signatureVerifyDescBottom'
        className='mt-9'
        refreshIsSignatureValid={props.refreshIsSignatureValid}
      />
    )
  return <NoRecord />
}

export function MarketTradeStateTag({ marketTradeState }: { marketTradeState: number }) {
  const { t } = useTranslation()
  let text = undefined
  if (marketTradeState === MARKET_STATUS.CLOSE || marketTradeState === MARKET_STATUS.AFTER) {
    text = t('v3.t13')
  }
  if (marketTradeState === MARKET_STATUS.BEFORE) {
    text = t('v3.t11')
  }
  if (!text) return null
  return (
    <span className='text-xs/[15px] rounded-[2px] text-gray-400 font-normal bg-opacity-03 px-1 py-[2px]'>
      {text}
    </span>
  )
}

export function QuoteName(props: {
  isFavorite: boolean
  toggleEnable: boolean
  toggleFavorite: (stockId: number) => void
  logo: string
  symbol: string
  name: string
  stockId: number
}) {
  return (
    <>
      <LazyImage
        onClick={ev => {
          ev.stopPropagation()
          if (!props.toggleEnable) return
          props.toggleFavorite(props.stockId)
        }}
        src={props.isFavorite ? '/images/v2/icons/collected.png' : '/images/v2/icons/collect.png'}
        className={cn('w-4 h-4 mr-3', props.toggleEnable ? 'cursor-pointer' : 'cursor-not-allowed')}
      />
      <LazyImage src={props.logo} className='w-12 h-12 mr-2 rounded-[50%]' />
      <div className='flex flex-col overflow-hidden'>
        <TextCell text={props.symbol} className='text-base/5 text-white font-normal' />
        <IconWithTooltip tooltip={props.name} triggerClassName='justify-start'>
          <span className='text-xs/[15px] text-gray-400 font-normal truncate'>{props.name}</span>
        </IconWithTooltip>
      </div>
    </>
  )
}

export function TextCell(props: {
  text: string
  className?: string
  icon?: string
  textClassName?: string
}) {
  return (
    <div className={cn('flex flex-row gap-1 items-center', props.className)}>
      {props.icon && <LazyImage className='w-2 h-2' src={props.icon} />}
      <span className={cn(props.textClassName)}>{props.text}</span>
    </div>
  )
}

export function getColorAndIcon(change: Change) {
  switch (change) {
    case 0:
      return { color: 'text-gray-400', icon: '' }
    case 1:
      return { color: 'text-green-50', icon: '/images/convert/price_up.png' }
    case -1:
      return { color: 'text-red-50', icon: '/images/convert/price_down.png' }
    default:
      return { color: 'text-gray-400', icon: '' }
  }
}

export function TextCellWithColor(props: { text: string; change: Change; withIcon: boolean }) {
  const { icon, color } = getColorAndIcon(props.change)

  return (
    <TextCell
      className={cn('text-sm/4.5 font-normal', color)}
      text={props.text}
      icon={props.withIcon ? icon : ''}
    />
  )
}
