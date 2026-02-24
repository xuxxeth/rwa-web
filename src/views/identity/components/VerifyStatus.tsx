import { useMemo } from 'react'
import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from '@/hooks/useRouter'
import { useUSDT, useRwaTokens } from '@/hooks/useTokens'
import { useTokenBalances, useAccount } from 'ca-common-web'
import { useEffect, useState, type ReactNode } from 'react'
import { formatUp, isLess, parseAmount, textPrefix, toFixed } from '@/utils'
import type { ApiResponse } from '@/service/client'
import type { IKycDetail } from '@/service/kyc/types'

import { symbolToLower, cn, getUpColor } from '@/utils'
import useRwaWithPriceAndUp from '@/hooks/useRwaWithPriceAndUp'
import { useTradeStore } from '@/stores/tradeStore'
import { useKycStore } from '@/stores/kycStore'

export type VerifyType = 'succeeded' | 'failed' | 'verifying'

export function VerifySucceeded() {
  const router = useRouter()
  const isTokenQualified = useIsTokenQualified()

  const extra =
    isTokenQualified === undefined ? null : isTokenQualified ? <HotRwas /> : <TradePrepare />

  return (
    <VerifyStatus
      type='succeeded'
      title='ok'
      detail='okTip'
      btnText='m'
      btnOnClick={() => router.push('/markets')}
      extra={extra}
    />
  )
}

export function OCRVerifyFailed(props: { retry: () => void }) {
  return <VerifyStatus type='failed' title='vf' detail='r' btnText='rv' btnOnClick={props.retry} />
}

export function FaceRecognitionFailed(props: { retry: () => void }) {
  return (
    <VerifyStatus type='failed' title='vf' detail='fTip' btnText='rv' btnOnClick={props.retry} />
  )
}

export function VerifyIssue() {
  const router = useRouter()
  return (
    <VerifyStatus
      type='failed'
      title='f'
      detail='issue'
      btnText='h'
      btnOnClick={() => router.push('/')}
    />
  )
}

export function VerifyFailed() {
  const router = useRouter()
  return (
    <VerifyStatus
      type='failed'
      title='f'
      detail='r'
      btnText='h'
      btnOnClick={() => router.push('/')}
    />
  )
}

function VerifyStatus(props: {
  type: VerifyType
  title: string
  detail: string
  btnText: string
  btnOnClick?: () => void
  extra?: ReactNode
  retryComponent?: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <VerifyStatusWrapper>
      <LazyImage src={getIconFromType(props.type)} className='w-[120px] h-[90px] pt-5' />
      <div>
        <div className='text-2xl mb-2 text-center'>{t(`${langPrefix}.${props.title}`)}</div>
        <div className='text-base text-[#909090] text-center'>{t(`${langPrefix}.${props.detail}`)}</div>
      </div>
      <Button
        onClick={() => {
          if (props.btnOnClick) {
            props.btnOnClick()
          }
        }}
        text={props.btnText}
      />
      {props.extra}
    </VerifyStatusWrapper>
  )
}

function VerifyStatusWrapper(props: { children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className='bg-[#0E0E0E] p-8'>
      <div className='text-lg font-medium pb-4 border-b border-white/10'>
        {t(`${langPrefix}.res`)}
      </div>
      <div className='flex flex-col gap-5 items-center'>{props.children}</div>
    </div>
  )
}

function getIconFromType(type: VerifyType) {
  switch (type) {
    case 'succeeded':
      return '/images/icons/identity/success.png'
    case 'failed':
      return '/images/icons/identity/fail.png'
    case 'verifying':
      return '/images/icons/identity/verifying.png'
    default:
      throw new Error(`type ${type} is not supported`)
  }
}

const langPrefix = 'identity.result'

const MIN_USDT_AMOUNT = '20'
const MIN_NATIVE_TOKEN_AMOUNT = '0.0001'

function useIsTokenQualified() {
  const account = useAccount()

  const usdt = useUSDT()
  const { getBalance, getTokenBalances } = useTokenBalances()

  const [balances, setBalances] = useState<{ usdt: bigint; nativeToken: bigint } | undefined>(
    undefined
  )

  useEffect(() => {
    if (!usdt || !account) return
    setBalances(undefined)
    Promise.all([
      getBalance(account),
      getTokenBalances(account, [usdt.address as `0x${string}`]),
    ]).then(res => {
      setBalances({ usdt: res[1][0].balance as bigint, nativeToken: res[0] })
    })
  }, [usdt, account])

  if (balances === undefined || !usdt) return undefined

  if (isLess(balances.usdt, parseAmount(MIN_USDT_AMOUNT, usdt.decimals))) return false
  if (isLess(balances.nativeToken, parseAmount(MIN_NATIVE_TOKEN_AMOUNT, 18))) return false

  return true
}

function TradePrepare() {
  const { t } = useTranslation()
  return (
    <div className='flex flex-col gap-4 text-base text-[#1A85FF]'>
      <a
        href='https://tiko.gitbook.io/tiko-docs/faq/how-to-prepare-for-trading-on-tiko'
        target='_blank'
        className='flex flex-row items-center gap-1.5'
      >
        {t(`${langPrefix}.pre1`)} <LazyImage src='/images/icons/identity/arrow-narrow.svg' />
      </a>
      <a
        href='https://tiko.gitbook.io/tiko-docs/faq/how-to-buy-my-first-u.s.-stock-on-tiko-step-by-step'
        target='_blank'
        className='flex flex-row items-center gap-1.5'
      >
        {t(`${langPrefix}.pre2`)} <LazyImage src='/images/icons/identity/arrow-narrow.svg' />
      </a>
    </div>
  )
}

// 热门列表 Symbol 前缀集合
const HotRwsSymbolSet = new Set(
  ['AAPL', 'COIN', 'HOOD', 'TSLA', 'NVDA', 'GOOGL'].map(item => item.toLowerCase())
)

function HotRwas() {
  const { t } = useTranslation()
  const rwaList = useRwaTokens()
  const router = useRouter()

  const displayList = useMemo(() => {
    const list = rwaList.filter(rwa => {
      const lowerSymbol = rwa.symbol.toLowerCase()
      for (const prefix of HotRwsSymbolSet) {
        if (lowerSymbol.startsWith(prefix)) {
          return true
        }
      }
      return false
    })
    return list
  }, [rwaList])

  const rwaWithPriceAndUp = useRwaWithPriceAndUp(displayList)

  return (
    <>
      <div className='text-2xl mt-5'>{t(`${langPrefix}.hot`)}</div>
      <div className='grid grid-cols-3 gap-4 cursor-pointer font-medium'>
        {rwaWithPriceAndUp.map(rwa => {
          return (
            <div
              key={rwa.symbol}
              className='flex flex-row items-center p-3 bg-[#1C1C1C] rounded-lg'
              onClick={() => {
               
                router.push('/trade/' + rwa.symbol)
              }}
            >
              <LazyImage src={rwa.icon} className='w-[42px] h-[42px] mr-3 rounded-lg' />
              <div className='flex flex-col gap-1 mr-3 w-[68px]'>
                <div className='text-base'>{rwa.symbol}</div>
                <div className='text-sm text-60 whitespace-nowrap'>{rwa.name}</div>
              </div>
              <div className='flex flex-col gap-1 mr-3'>
                <div className='text-base'>
                  {rwa.price ? textPrefix(toFixed(rwa.price, rwa.precision), '$') : '--'}
                </div>
                <div className={cn('text-sm text-[#1A85FF]', getUpColor(rwa.change))}>
                  <button className='bg-white/10 px-2 py-[2px] rounded-sm'>
                    {formatUp(rwa.up)}
                  </button>
                </div>
              </div>
              <LazyImage src='/images/icons/identity/arrow.png' className='w-4 h-[9px]' />
            </div>
          )
        })}
      </div>
    </>
  )
}

export function Verifying(props: { refresh: () => Promise<ApiResponse<IKycDetail>> }) {
  const router = useRouter()
  const retryCount = useKycStore(state => state.retryCount)
  return (
    <VerifyStatus
      type='verifying'
      title='verifying'
      detail= {retryCount > 0 && retryCount < 3 ? 'verifyingWait' : 'verifyingTip'} 
      btnText='m'
      btnOnClick={() => router.push('/markets')}
    />
  )
}

function Button({ onClick, text }: { onClick: () => void; text: string }) {
  const { t } = useTranslation()
  return (
    <div>
      <button
        onClick={onClick}
        className='w-[402px] h-[46px] border rounded-lg cursor-pointer border-white bg-transparent text-white tex-base font-bold'
      >
        {t(`${langPrefix}.${text}`)}
      </button>
    </div>
  )
}
