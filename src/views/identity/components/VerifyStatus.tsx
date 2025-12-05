import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from '@/hooks/useRouter'

export default function VerifyStatus({ overallStatus }: { overallStatus: number }) {
  const { t } = useTranslation()

  let content = null
  if (overallStatus === 2) {
    content = <VerifySuccessed />
  }

  if (overallStatus === 3) {
    content = <VerifyFailed />
  }

  return (
    <div className='bg-[#0E0E0E] p-8'>
      <div className='text-lg font-medium pb-4 border-b border-white/10'>
        {t(`${langPrefix}.res`)}
      </div>
      {content}
    </div>
  )
}

const langPrefix = 'identity.result'

export function VerifySuccessed() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <div className='flex flex-col gap-5 items-center'>
      <LazyImage src='/images/icons/identity/success.png' className='w-[120px] h-[90px] pt-5' />
      <div>
        <div className='text-2xl mb-2 text-center'>{t(`${langPrefix}.ok`)}</div>
        <div className='text-base text-[#909090]'>{t(`${langPrefix}.okTip`)}</div>
      </div>
      <Button onClick={() => router.push('/markets/quotes')} text='m' />
    </div>
  )
}

export function VerifyFailed() {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <div className='flex flex-col gap-5 items-center'>
      <LazyImage src='/images/icons/identity/fail.png' className='w-[120px] h-[90px] pt-5' />
      <div>
        <div className='text-2xl mb-2 text-center'>{t(`${langPrefix}.f`)}</div>
        <div className='text-base text-[#909090]'>{t(`${langPrefix}.r`)}</div>
      </div>
      <Button onClick={() => router.push('/')} text='h' />
    </div>
  )
}

export function Verifying() {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <div className='flex flex-col gap-5 items-center'>
      <LazyImage src='/images/icons/identity/verifying.png' className='w-[120px] h-[90px] pt-5' />
      <div>
        <div className='text-2xl mb-2 text-center'>{t(`${langPrefix}.verifying`)}</div>
        <div className='text-base text-[#909090]'>{t(`${langPrefix}.verifyingTip`)}</div>
      </div>
      <Button onClick={() => router.push('/')} text='h' />
    </div>
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
