import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from '@/hooks/useRouter'
import { useUSDT, useRwaTokens } from '@/hooks/useTokens'
import { useTokenBalances, useAccount } from 'ca-common-web'
import { useEffect, useState, type ReactNode } from 'react'
import { isLess, parseAmount } from '@/utils'
import { useSearchParams } from 'react-router-dom'

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
      btnOnClick={() => router.push('/markets/quotes')}
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
        <div className='text-base text-[#909090]'>{t(`${langPrefix}.${props.detail}`)}</div>
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

// export default function VerifyStatus({ overallStatus }: { overallStatus: number }) {
//   const { t } = useTranslation()

//   let content = null
//   if (overallStatus === 2) {
//     content = <VerifySucceeded />
//   }

//   if (overallStatus === 3) {
//     content = <VerifyFailed />
//   }

//   return (
//     <div className='bg-[#0E0E0E] p-8'>
//       <div className='text-lg font-medium pb-4 border-b border-white/10'>
//         {t(`${langPrefix}.res`)}
//       </div>
//       {content}
//     </div>
//   )
// }

const langPrefix = 'identity.result'

// export function VerifySucceeded() {
//   const { t } = useTranslation()
//   const router = useRouter()

//   const isTokenQualified = useIsTokenQualified()

//   return (
//     <div className='flex flex-col gap-5 items-center'>
//       <LazyImage src='/images/icons/identity/success.png' className='w-[120px] h-[90px] pt-5' />
//       <div>
//         <div className='text-2xl mb-2 text-center'>{t(`${langPrefix}.ok`)}</div>
//         <div className='text-base text-[#909090]'>{t(`${langPrefix}.okTip`)}</div>
//       </div>
//       <Button onClick={() => router.push('/markets/quotes')} text='m' />
//       {isTokenQualified === undefined ? (
//         'checking is token qualified...'
//       ) : isTokenQualified ? (
//         <HotRwas />
//       ) : (
//         <TradePrepare />
//       )}
//     </div>
//   )
// }

const MIN_USDT_AMOUNT = '10'
const MIN_NATIVE_TOKEN_AMOUNT = '0.05'

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
      <a href='#pre1' target='_blank' className='flex flex-row items-center gap-1.5'>
        {t(`${langPrefix}.pre1`)} <LazyImage src='/images/icons/identity/arrow-narrow.svg' />
      </a>
      <a href='#pre2' target='_blank' className='flex flex-row items-center gap-1.5'>
        {t(`${langPrefix}.pre2`)} <LazyImage src='/images/icons/identity/arrow-narrow.svg' />
      </a>
    </div>
  )
}

function HotRwas() {
  const { t } = useTranslation()
  const rwaList = useRwaTokens()
  const top6RwaList = rwaList.sort((a, b) => b.weight - a.weight).slice(0, 4)

  return (
    <>
      <div className='text-2xl mt-5'>{t(`${langPrefix}.hot`)}</div>
      <div className='grid grid-cols-3 gap-5'>
        {top6RwaList.map(rwa => {
          return (
            <div
              key={rwa.symbol}
              className='flex flex-row items-center justify-center gap-4 p-4 bg-[#1C1C1C] rounded-lg'
            >
              <LazyImage src={rwa.icon} className='w-[42px] h-[42px] rounded-lg' />
              <div className='flex flex-col'>
                <div className='text-base'>{rwa.symbol}</div>
                <div className='text-sm text-60'>{rwa.name}</div>
              </div>
              <div className='flex flex-col'>
                <div className='text-base'>$203.33</div>
                <div className='text-sm text-60'>{rwa.name}</div>
              </div>
              <LazyImage src='/images/icons/identity/arrow-narrow.svg' />
            </div>
          )
        })}
      </div>
    </>
  )
}

export function Verifying() {
  const router = useRouter()

  return (
    <VerifyStatus
      type='verifying'
      title='verifying'
      detail='verifyingTip'
      btnText='m'
      btnOnClick={() => router.push('/markets/quotes')}
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
