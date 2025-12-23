import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'
import QRCode from '@/components/qrcode'
import { useEffect, useState, type ReactNode } from 'react'
import { kycApi } from '@/service/kyc/api'
import type { IKycDetail } from '@/service/kyc/types'
import { KYC_STATUS } from '@/service/kyc/types'
import type { ApiResponse } from '@/service/client'

const faceLangPrefix = 'identity.face'

export default function FaceRecognition({
  refresh: refreshKycDetail,
  onResetRetry,
  status,
}: {
  refresh: () => Promise<ApiResponse<IKycDetail>>
  onResetRetry: () => void
  status?: number
}) {
  const { t } = useTranslation()
  // undefined 表示还没有请求
  // null 表示请求回来，为 null
  const [urlInfo, setUrlInfo] = useState<
    { url: string; expireTime: number; bizNo: string } | undefined | null
  >(undefined)
  const [isExpired, setIsExpired] = useState(false)
  const [isMaxTimesReached, setIsMaxTimesReached] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const refreshQrCode = async () => {
    const { data } = await kycApi.getLivenessUrl()
    setIsExpired(data.expireTime ? data.expireTime < Date.now() : false)
    setErrorMsg('')
    setIsMaxTimesReached(false)

    if (data.url && data.expireTime) {
      setUrlInfo({ url: data.url, expireTime: data.expireTime, bizNo: data.bizNo! })
    } else {
      setUrlInfo(null)
      setErrorMsg(data.errorMsg || '')
      if (!data.errorMsg && data.leftAvailableTimes === 0) {
        setIsMaxTimesReached(true)
      }
    }
  }

  useEffect(() => {
    refreshQrCode()
  }, [])

  useEffect(() => {
    if (status && status === KYC_STATUS.VERIFYING) {
      onResetRetry()
    }
  }, [status])

  useEffect(() => {
    if (isExpired || !urlInfo || !urlInfo.url || !urlInfo.expireTime || !urlInfo.bizNo) return

    let timer: NodeJS.Timeout
    let canceled = false

    const checkExpiration = async () => {
      try {
        if (urlInfo.expireTime! < Date.now()) {
          setIsExpired(true)
        }
        const { data: isUsed } = await kycApi.isLivenessUrlExpired(urlInfo.bizNo)

        if (canceled) return

        if (isUsed) {
          setIsExpired(true)
        }
      } finally {
        if (!canceled) {
          timer = setTimeout(checkExpiration, 1000 * 3)
        }
      }
    }

    checkExpiration()
    return () => {
      canceled = true
      clearTimeout(timer)
    }
  }, [isExpired, urlInfo])

  // 每 2s 刷新一次 kyc 详情
  useEffect(() => {
    let timer: NodeJS.Timeout
    let canceled = false

    const loop = async () => {
      try {
        await refreshKycDetail()
      } finally {
        if (!canceled) {
          timer = setTimeout(loop, 1000 * 2)
        }
      }
    }

    loop()

    return () => {
      canceled = true
      clearTimeout(timer)
    }
  }, [])

  if (urlInfo === undefined) return null

  return (
    <div className='p-8 bg-[#0E0E0E] rounded-lg flex flex-col gap-5'>
      <div className='text-lg'>{t(`${faceLangPrefix}.rg`)}</div>
      <div className='text-base text-60'>{t(`${faceLangPrefix}.title`)}</div>
      <div className='m-4 self-center relative box-content w-[224px] h-[224px]'>
        {!isMaxTimesReached && urlInfo && urlInfo.url && <QRCode value={urlInfo.url} size={224} />}
        {isMaxTimesReached ? (
          <MaxTimesReached />
        ) : isExpired ? (
          <QrCodeMask>
            <QrCodeExpirted refresh={refreshQrCode} />
          </QrCodeMask>
        ) : null}
      </div>

      <div className='text-base text-60 px-5 py-3 rounded-sm bg-[#361604] flex items-center'>
        <LazyImage src='/images/kyc/warning.png' className='w-5 h-5 mr-1' />
        {errorMsg ? errorMsg : t(`${faceLangPrefix}.${isMaxTimesReached ? 'times' : 'tip'}`)}
      </div>
    </div>
  )
}

// 二维码过期
function QrCodeExpirted({ refresh }: { refresh: () => Promise<void> }) {
  const { t } = useTranslation()
  return (
    <button
      onClick={refresh}
      className='relative w-[62px] h-[62px] cursor-pointer bg-[#1D1D1D] rounded-lg flex flex-row items-center justify-center'
    >
      <LazyImage src='/images/icons/identity/refresh.png' className='w-[23px] h-7' />
      <div className='absolute left-0 w-full bottom-[-30px] text-[10px] text-white'>
        <span className='text-base'>{t(`${faceLangPrefix}.fresh`)}</span>
      </div>
    </button>
  )
}

// 二维码失效
function QrCodeInvalid() {
  const { t } = useTranslation()
  return <span className='text-white text-base'>{t(`${faceLangPrefix}.invalid`)} </span>
}

function MaxTimesReached() {
  return (
    <>
      <QRCode
        value={'You have reached today’s verification limit. Please try again tomorrow.'}
        size={224}
      />
      <QrCodeMask>
        <QrCodeInvalid />
      </QrCodeMask>
    </>
  )
}

function QrCodeMask(props: { children: ReactNode }) {
  return (
    <div className='w-[224px] h-[224px] absolute inset-0 bg-black/80 flex flex-row items-center justify-center'>
      {props.children}
    </div>
  )
}
