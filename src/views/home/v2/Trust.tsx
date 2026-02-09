import React, { useRef, useState, useEffect } from 'react'
import { useTranslation, Trans } from '@/hooks/useTranslation'
import { FileBarChart2, Building2, ShieldCheck, Cpu, CheckCircle2 } from 'lucide-react'
import { HighlightText } from './ui/HighlightText'

interface TrustItem {
  title: string
  topTag: string
  bottomTag: string
  description: string
}

export const Trust: React.FC = () => {
  const { t, i18n } = useTranslation('home')
  const language = i18n.language
  const iconMap = [FileBarChart2, Building2, ShieldCheck, Cpu]

  // Animation state for the title underline
  const [isTitleVisible, setIsTitleVisible] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsTitleVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (titleRef.current) {
      observer.observe(titleRef.current)
    }
    return () => observer.disconnect()
  }, [])

  return (
    // Refactored spacing:
    // pt-16 (64px) top padding
    // pb-24 (96px) bottom padding
    <section
      id='trust'
      className='bg-[#131416] relative w-full pt-16 pb-24 md:pb-32 overflow-hidden'
    >
      {/* Separator Line - Gradient matching WhyUs section */}
      <div className='absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-20' />

      {/* Security Grid Background */}
      <div
        className='absolute inset-0 opacity-[0.03] pointer-events-none z-0'
        style={{
          backgroundImage:
            'linear-gradient(#9CFF3A 1px, transparent 1px), linear-gradient(90deg, #9CFF3A 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className='max-w-7xl mx-auto px-6 relative z-10'>
        {/* Header - Adjusted mb-16 (64px) to match pt-16, centering the title visually */}
        <div className='mb-16 text-center relative'>
          <h3
            ref={titleRef}
            className='text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight'
          >
            <Trans
              i18nKey='trust.title'
              t={t}
              components={{
                1: (
                  <HighlightText
                    isVisible={isTitleVisible}
                    delay='delay-500'
                    className={language === 'zh' ? 'mx-1' : 'mr-2'}
                  />
                ),
                2: (
                  <HighlightText
                    isVisible={isTitleVisible}
                    delay='delay-[1300ms]'
                    className={language === 'zh' ? 'mx-1' : 'ml-2'}
                  />
                ),
              }}
            />
          </h3>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {(t('trust.items', { returnObjects: true }) as TrustItem[]).map((item, idx) => {
            const Icon = iconMap[idx]
            return (
              <div
                key={idx}
                // Updated rounded-[32px] to rounded-3xl to match WhyUs cards
                className='group relative bg-[#131416] border border-white/5 rounded-3xl p-8 overflow-hidden hover:border-[#9CFF3A]/30 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full min-h-[300px]'
              >
                {/* Security Scanner Light Effect */}
                <div className='absolute top-0 left-0 w-full h-[2px] bg-[#9CFF3A] opacity-0 group-hover:opacity-100 shadow-[0_0_20px_rgba(156,255,58,0.8)] transition-opacity duration-300'>
                  <div className='absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#9CFF3A]/20 to-transparent transform translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-[1.5s] ease-in-out' />
                </div>

                {/* Status Indicator */}
                <div className='absolute top-8 right-8 flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-300'>
                  <div className='w-1.5 h-1.5 rounded-full bg-[#9CFF3A] animate-pulse' />
                  <span className='text-[10px] text-[#9CFF3A] font-mono tracking-wider uppercase'>
                    {item.topTag}
                  </span>
                </div>

                {/* Icon */}
                <div className='w-14 h-14 rounded-2xl bg-[#1A1B1E] border border-white/10 flex items-center justify-center text-white mb-8 group-hover:bg-[#9CFF3A] group-hover:text-black group-hover:scale-110 transition-all duration-500 relative z-10'>
                  <Icon size={28} strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className='relative z-10 flex-grow'>
                  <h4 className='text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[#9CFF3A] transition-colors duration-300 leading-tight'>
                    {item.title}
                  </h4>

                  <p className='text-gray-400 text-base md:text-lg  font-light'>
                    <Trans
                      i18nKey={`trust.items.${idx}.description`}
                      defaults={item.description}
                      components={{
                        1: (
                          <span className='font-semibold text-white border-b border-white/20 pb-0.5' />
                        ),
                      }}
                    />
                  </p>
                </div>

                {/* Bottom Decoration */}
                <div className='mt-8 pt-6 border-t border-white/5 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity duration-500'>
                  <span className='text-[10px] text-gray-500 font-mono tracking-wider'>
                    {item.bottomTag}
                  </span>
                  <CheckCircle2 size={14} className='text-[#9CFF3A]' />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
