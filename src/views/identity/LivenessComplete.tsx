import { LazyImage } from '@/components/image/LazyImage'
import { CA_LANGUAGE } from '@/config/constants'
import { useTranslation } from '@/hooks/useTranslation'
import storage from '@/utils/storage'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const langPrefix = 'identity.face'

export default function LivenessComplete() {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const success = searchParams.get('success') === 'true'
  const failReason = parseInt(searchParams.get('failReason') || '0')

  const lang = searchParams.get('language') || storage.getItem(CA_LANGUAGE) || i18n.language

  useEffect(() => {
    if (!lang) return
    if (lang === storage.getItem(CA_LANGUAGE)) return
    storage.setItem(CA_LANGUAGE, lang)
  }, [lang, i18n])

  const { icon, title, subTitle } = getIconAndText(success, failReason)

  return (
    <div>
      <div className='px-4 h-[56px] flex flex-row items-center justify-left gap-2'>
        <LazyImage src='/images/logo_dark_v2.svg' />
        {/* <LazyImage className='w-[145px] h-6' src='/images/logo_white_text.png' /> */}
      </div>
      <div className='p-8'>
        <LazyImage src={`/images/icons/identity/${icon}`} className='w-[195px] h-[192px] m-auto' />
      </div>
      <div className='text-xl text-center text-white'>{t(`${langPrefix}.${title}`)}</div>
      <div className='mt-4 text-base text-center text-white'>{t(`${langPrefix}.${subTitle}`)}</div>
    </div>
  )
}

function getIconAndText(success: boolean, failReason: number) {
  if (success) {
    return {
      icon: 'liveness-ok.png',
      title: 'complete',
      subTitle: 'sub0',
    }
  }

  switch (failReason) {
    case 1:
      return {
        icon: 'liveness-interrupt.png',
        title: 'f1',
        subTitle: 'sub1',
      }
    case 2:
      return {
        icon: 'liveness-fail.png',
        title: 'f2',
        subTitle: 'sub2',
      }
    case 3:
      return {
        icon: 'liveness-warn.png',
        title: 'f2',
        subTitle: 'sub3',
      }
  }
  return {
    icon: 'liveness-warn.png',
    title: 'f2',
    subTitle: 'sub3',
  }
}
