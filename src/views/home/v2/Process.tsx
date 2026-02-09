import React, { useState, useEffect, useRef } from 'react'
import { Section } from './ui/Section'
import { useTranslation, Trans } from '@/hooks/useTranslation'
import { HighlightText } from './ui/HighlightText'
import { OrderIcon, ExecutionIcon, SettlementIcon, DeliveryIcon } from './ui/ProcessIcons'

interface ProcessItem {
  id: number
  title: string
  description: string
}

export const Process: React.FC = () => {
  const { t, i18n } = useTranslation('home')
  const language = i18n.language

  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Themes are kept for the subtle top border line, but removed from the icon
  const stepThemes = [
    { hex: '#B0F16B' },
    { hex: '#73EFCE' },
    { hex: '#62D9EE' },
    { hex: '#939DFB' },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const icons = [OrderIcon, ExecutionIcon, SettlementIcon, DeliveryIcon]

  return (
    // Updated:
    // !pt-0 to reduce gap with Compliance section
    // !pb-[80px] to match the gap between Compliance and Process
    <Section id='process' className='bg-[#F8FAFC] !overflow-visible !pt-0 !pb-[80px]'>
      <div className='absolute top-20 left-0 w-[500px] h-[500px] bg-[#B0F16B]/10 blur-[120px] rounded-full pointer-events-none opacity-50' />
      <div className='absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#939DFB]/10 blur-[120px] rounded-full pointer-events-none opacity-50' />

      {/* Constrained Container for tighter layout (max-w-5xl) */}
      <div
        ref={sectionRef}
        className='max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 relative z-10'
      >
        {/* Left Column (Text) - Added pt-3 to push text down slightly to align with right-side cards */}
        <div className='lg:col-span-5 relative pt-3'>
          <div className='sticky top-32'>
            {/* Reduced title size from text-6xl to text-5xl. Increased leading to 1.3 and applied !leading to force override. */}
            <h2 className='text-2xl md:text-4xl lg:text-5xl font-bold text-black !leading-[1.3] mb-8 whitespace-pre-line'>
              <Trans
                i18nKey='process.title'
                t={t}
                components={{
                  1: (
                    <HighlightText
                      isVisible={isVisible}
                      delay='delay-500'
                      className={language === 'en' ? 'mr-4 md:mr-6' : 'mx-1'}
                      svgClassName='-bottom-0'
                    />
                  ),
                }}
              />
            </h2>

            {t('process.subtitle') && (
              <p className='text-base md:text-lg text-gray-500 leading-relaxed font-medium'>
                {t('process.subtitle')}
              </p>
            )}
          </div>
        </div>

        <div className='lg:col-span-7 flex flex-col gap-6'>
          {(t('process.items', { returnObjects: true }) as ProcessItem[]).map((item, idx) => {
            const theme = stepThemes[idx % stepThemes.length]
            const Icon = icons[idx] || icons[0]

            return (
              <div
                key={item.id}
                className='group relative bg-white border border-gray-100 rounded-3xl p-8 md:p-10 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1 overflow-hidden'
              >
                <div
                  className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'
                  style={{
                    background: `linear-gradient(135deg, ${theme.hex}15 0%, transparent 50%)`,
                  }}
                />

                <div
                  className='absolute top-0 left-0 w-0 h-1 transition-all duration-700 ease-out group-hover:w-full'
                  style={{ backgroundColor: theme.hex }}
                />

                <div className='relative z-10 flex flex-col sm:flex-row items-start gap-6 md:gap-8'>
                  {/* Updated Icon Container: 
                                - Fixed Light Gray Style (bg-gray-50 border-gray-100/50)
                                - Added group-hover:bg-transparent group-hover:border-transparent to make it invisible on hover
                                - Changed transition-transform to transition-all
                            */}
                  <div className='w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 bg-gray-50 border border-gray-100/50 group-hover:bg-transparent group-hover:border-transparent'>
                    <div className='w-8 h-8 text-gray-400 group-hover:text-gray-500 transition-colors duration-300'>
                      <Icon />
                    </div>
                  </div>

                  <div className='flex-1 w-full'>
                    <div className='flex items-center justify-between mb-3'>
                      <h3 className='text-xl md:text-2xl font-bold text-gray-900 group-hover:text-black transition-colors'>
                        {item.title}
                      </h3>
                      <span className='text-4xl md:text-5xl font-bold text-gray-100 font-mono select-none group-hover:text-gray-200 transition-colors'>
                        0{item.id}
                      </span>
                    </div>
                    <p className='text-gray-500 font-normal text-base md:text-lg group-hover:text-gray-600'>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
