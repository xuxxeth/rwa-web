import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState, type ReactNode } from 'react'
import { type ILivenessUrlRes } from '@/service/kyc/types'
import { kycApi } from '@/service/kyc/api'

const faceLangPrefix = 'identity.face'

export default function FaceRecognition({
  refresh,
  isFaceVerifyFailed,
}: {
  refresh: () => Promise<void>
  isFaceVerifyFailed: boolean
}) {
  const [isRetry, setIsRetry] = useState(false)

  if (isFaceVerifyFailed && !isRetry) {
    return <FaceRecognitionFailed onRetry={() => setIsRetry(true)} />
  }

  return <FaceRecognitionOperation refresh={refresh} />
}

function FaceRecognitionOperation({ refresh: refreshKycDetail }: { refresh: () => Promise<void> }) {
  const { t } = useTranslation()
  const [urlInfo, setUrlInfo] = useState<ILivenessUrlRes | undefined>(undefined)
  const [isExpired, setIsExpired] = useState(false)

  const refreshQrCode = async () => {
    const { data } = await kycApi.getLivenessUrl()
    setUrlInfo(data)
    setIsExpired(false)
  }

  useEffect(() => {
    refreshQrCode()
  }, [])

  const MockUrlAndExpired = {
    url: 'https://api.yljz.com/finauth/lite/do?token=795abfdc68778ca00493d36d49c1a14f',
    expireTime: Date.now() + 6 * 1000,
  }

  useEffect(() => {
    if (isExpired || !urlInfo) return

    const checkExpiration = () => {
      if (urlInfo.expireTime < Date.now()) {
        setIsExpired(true)
      } else {
        setIsExpired(false)
      }
    }

    checkExpiration()
    const interval = setInterval(() => {
      checkExpiration()
    }, 1000 * 2)

    return () => {
      clearInterval(interval)
    }
  }, [isExpired, urlInfo])

  // 每 2s 刷新一次 kyc 详情
  useEffect(() => {
    refreshKycDetail()
    const interval = setInterval(() => {
      refreshKycDetail()
    }, 1000 * 2)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className='p-8 bg-[#0E0E0E] rounded-lg flex flex-col gap-5'>
      <div className='text-lg'>{t(`${faceLangPrefix}.rg`)}</div>
      <div className='text-base text-60'>{t(`${faceLangPrefix}.title`)}</div>
      <div className='m-4 self-center relative box-content w-[224px] h-[224px]'>
        <QRCodeSVG value={MockUrlAndExpired.url} size={224} />
        {isExpired ? (
          <QrCodeMask>
            <QrCodeExpirted refresh={refreshQrCode} />
          </QrCodeMask>
        ) : null}
      </div>

      <div className='text-base text-60 px-5 py-3 rounded-sm bg-[#361604] flex items-center'>
        <LazyImage src='/images/kyc/warning.png' className='w-5 h-5 mr-1' />
        {t(`${faceLangPrefix}.tip`)}
      </div>
    </div>
  )
}

// 二维码过期
function QrCodeExpirted({ refresh }: { refresh: () => Promise<void> }) {
  const { t } = useTranslation()
  return (
    <button className='relative w-[62px] h-[62px] cursor-pointer bg-[#1D1D1D] rounded-lg flex flex-row items-center justify-center'>
      <LazyImage src='/images/icons/identity/refresh.png' className='w-[23px] h-7' />
      <div
        className='absolute left-0 w-full bottom-[-30px] text-[10px] text-white'
        onClick={refresh}
      >
        <span className='text-base'>{t(`${faceLangPrefix}.fresh`)}</span>
      </div>
    </button>
  )
}

const resultLangPrefix = 'identity.result'

function FaceRecognitionFailed({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <div className='bg-[#0E0E0E] p-8'>
      <div className='text-lg font-medium pb-4 border-b border-white/10'>
        {t(`${resultLangPrefix}.res`)}
      </div>
      <div className='flex flex-col gap-5 items-center'>
        <LazyImage src='/images/icons/identity/fail.png' className='w-[120px] h-[90px] pt-5' />
        <div>
          <div className='text-2xl mb-2 text-center'>{t(`${faceLangPrefix}.f`)}</div>
          <div className='text-base text-[#909090]'>{t(`${faceLangPrefix}.ft`)}</div>
        </div>
        <button
          onClick={onRetry}
          className='w-[402px] h-[46px] border rounded-lg cursor-pointer border-white bg-transparent text-white tex-base font-bold'
        >
          {t(`${faceLangPrefix}.rv`)}
        </button>
      </div>
    </div>
  )
}

// 二维码失效
function QrCodeInvalid() {
  const { t } = useTranslation()
  return <span className='text-white text-base'>{t(`${faceLangPrefix}.invalid`)} </span>
}

function QrCodeMask(props: { children: ReactNode }) {
  return (
    <div className='w-[224px] h-[224px] absolute inset-0 bg-black/80 flex flex-row items-center justify-center'>
      {props.children}
    </div>
  )
}
