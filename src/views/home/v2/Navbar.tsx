import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Globe } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { LazyImage } from '@/components/image/LazyImage'
import { useRouter } from '@/hooks/useRouter'
import storage from '@/utils/storage'
import { CA_LANGUAGE } from '@/config/constants'

export const Navbar: React.FC = () => {
  const router = useRouter()

  const [isScrolled, setIsScrolled] = useState(false)
  const { t, i18n } = useTranslation('home')
  const language = i18n.language

  const changeLanguage = (lng: string) => {
    storage.setItem(CA_LANGUAGE, lng)
    i18n.changeLanguage(lng)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 flex justify-center transition-all duration-300 pointer-events-none ${isScrolled ? 'pt-3' : 'pt-4'}`}
    >
      <nav
        className={`
          pointer-events-auto
          w-[92%] max-w-7xl 
          bg-white/60 backdrop-blur-xl 
          border border-white/40
          rounded-full 
          shadow-[0_8px_32px_rgba(31,38,135,0.07)]
          transition-all duration-500 ease-in-out
          relative
          ${isScrolled ? 'py-2' : 'py-3'}
        `}
      >
        <div className='px-5 md:px-8 flex items-center justify-between'>
          <a className='cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity'>
            <LazyImage src='/images/logo_light_v2.svg' />
          </a>

          {/* Right Side Actions */}
          <div className='flex items-center gap-4 md:gap-6'>
            <Button
              onClick={() => router.push('/trade')}
              size='sm'
              variant='primary'
              className='shadow-none py-2 px-6'
            >
              {t('nav.launchApp')}
            </Button>

            {/* Language Switcher */}
            <div className='relative group h-full flex items-center'>
              <button className='cursor-pointer flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors outline-none p-1'>
                <Globe size={18} />
              </button>

              {/* Dropdown */}
              <div className='absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right'>
                <div className='bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-2 min-w-[140px] flex flex-col gap-1 overflow-hidden'>
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'zh', label: '繁體中文' },
                  ].map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => changeLanguage(code)}
                      className={`cursor-pointer text-left px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${language === code ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
