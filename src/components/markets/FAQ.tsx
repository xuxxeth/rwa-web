import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'
import { memo, useEffect, useMemo, useState } from 'react'
// import faqEn from '@/locales/faq/en.json'
// import faqZh from '@/locales/faq/zh.json'
import faqEn from '@/locales/faq/v2/en.json'
import faqZh from '@/locales/faq/v2/zh.json'

const FAQItem = memo(({ aq }: { aq: { a: string; q: string } }) => {
  const [expand, setExpand] = useState(false)

  return (
    <div className='bg-[rgba(255,255,255,0.08)] rounded-[8px]'>
      <div
        className='px-4 py-[14px] text-white font-medium text-[16px] flex items-center justify-between cursor-pointer'
        onClick={() => {
          setExpand(!expand)
        }}
      >
        {aq.q}
        <button
          className={cn(
            'transition-transform duration-300 transform cursor-pointer',
            expand ? ' rotate-180' : ' rotate-0'
          )}
        >
          <LazyImage src='/images/icons/caret-down.png' className={cn('w-5 h-5 ')} />
        </button>
      </div>
      {expand && (
        <div className=' text-[14px] font-normal text-[rgba(255,255,255,0.6)]  px-4 pb-4'>
          {aq.a}
        </div>
      )}
    </div>
  )
})

const faqDomain = 'https://tiko.gitbook.io/tiko-docs/faq/'
const FAQ_CONFIG = [
  {
    key: 'what_is_rwa',
    path: 'what-is-tiko-rwa-and-how-is-it-different-from-traditional-stocks',
  },
  {
    key: 'how_to_prepare',
    path: 'how-to-prepare-for-trading-on-tiko',
  },
  {
    key: 'how_to_complete',
    path: 'how-to-complete-the-kyc-verification',
  },
  {
    key: 'asset_security',
    path: 'asset-security-how-does-tiko-ensure-my-investment-is-safe',
  },
  {
    key: 'how_does_tiko_work',
    path: 'how-does-tiko-work-and-where-do-the-liquidity-and-prices-come-from',
  },
  {
    key: 'how_to_buy',
    path: 'how-to-buy-my-first-u.s.-stock-on-tiko-step-by-step',
  },
  {
    key: 'how_to_sell',
    path: 'how-to-sell-u.s.-stocks-and-withdraw-usdt',
  },
  {
    key: 'how_are_fees_calculated',
    path: 'what-are-fees-trading-with-tiko',
  },
  {
    key: 'trading_hours',
    path: 'u.s.-stock-trading-hours-and-2026-market-holidays',
  },
  {
    key: 'emergency_close',
    path: 'are-there-any-emergency-or-temporary-market-closures',
  },
]

const FAQ = memo(() => {
  const { t, i18n } = useTranslation()
  const faqList = useMemo(() => {
    return i18n.language === 'en' ? faqEn : faqZh
  }, [i18n.language])

  return (
    <div className='px-4 text-gray-400 font-medium'>
      <div className='text-base/5 pt-8 border-t border-t-gray-850'>{t('FAQ')}</div>
      <div className='flex flex-col text-xs/[15px]'>
        {/* {faqList.map(faq => (
          <FAQItem key={faq.q} aq={faq} />
        ))} */}
        {FAQ_CONFIG.map(({ key, path }) => (
          <div
            key={key}
            className='flex flex-row hover:text-white cursor-pointer text-sm/4.5 text-gray-400 font-normal items-start py-4 border-b border-b-gray-850'
          >
            <a href={faqDomain + path} rel='noopener noreferrer' target='_blank' className='flex-1'>
              {(faqList as any)[key]}
            </a>
            {/* <a
              href={faqDomain + path}
              target='_blank'
              className='basis-3.5 h-3.5'
              rel='noopener noreferrer'
            >
              <LazyImage src='/images/v2/icons/link.svg' className={cn('w-full h-full ')} />
            </a> */}
          </div>
        ))}
      </div>
    </div>
  )
})

export { FAQ }
export default FAQ
