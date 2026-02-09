import React, { useRef, useState, useEffect } from 'react'
import { useTranslation, Trans } from '@/hooks/useTranslation'
import { Reveal } from './ui/Reveal'
import SplitText from './ui/SplitText'
import { HighlightText } from './ui/HighlightText'
import { GlobalIcon, DividendsIcon, ComposabilityIcon, TikoLogo } from './ui/InnovationIcons'

interface InnovationItem {
  title: string
  description: string
}

export const Innovation: React.FC = () => {
  const { t, i18n } = useTranslation('home')
  const language = i18n.language

  const [isTitleVisible, setIsTitleVisible] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Auto-play state
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsTitleVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (titleRef.current) {
      observer.observe(titleRef.current)
    }
    return () => observer.disconnect()
  }, [])

  // Automatic Loop Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % 3)
    }, 4000) // Change card every 4 seconds

    return () => clearInterval(interval)
  }, [])

  const icons = [GlobalIcon, DividendsIcon, ComposabilityIcon]

  // Logic to process footer text
  const footerTextRaw = t('innovation.footer')
  const hasTiko = footerTextRaw.includes('Tiko')
  const cleanText = hasTiko ? footerTextRaw.split('Tiko')[1].trim() : footerTextRaw

  const handleAnimationComplete = () => {
    // console.log('All letters have animated!');
  }

  return (
    // Changed from generic Section to custom layout to support full-width footer
    <section id='innovation' className='relative pt-[80px]'>
      <div className='max-w-7xl mx-auto px-6 md:px-12 lg:px-24'>
        <div className='mb-20 flex flex-col md:flex-row md:items-end justify-center text-center'>
          <Reveal>
            <h3
              ref={titleRef}
              className='text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-none max-w-4xl'
            >
              <Trans
                i18nKey='innovation.title'
                t={t}
                components={{
                  1: (
                    <HighlightText
                      isVisible={isTitleVisible}
                      delay='delay-500'
                      className={language === 'zh' ? 'mx-2' : 'ml-3'}
                    />
                  ),
                }}
              />
            </h3>
          </Reveal>
        </div>

        <div className='grid md:grid-cols-3 gap-12 lg:gap-16'>
          {(t('innovation.items', { returnObjects: true }) as InnovationItem[]).map((item, idx) => {
            const isActive = activeIndex === idx

            return (
              <Reveal key={idx} delay={idx * 150} className='group cursor-default'>
                {/* Top Progress Line */}
                <div className='w-full h-[2px] bg-gray-200 mb-8 relative overflow-visible'>
                  <div
                    className={`absolute top-0 left-0 w-full h-full bg-[#9CFF3A] origin-left transition-transform duration-700 ease-in-out shadow-[0_0_15px_rgba(156,255,58,0.8)] ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                  />
                </div>

                <div className='flex justify-between items-start mb-6'>
                  {/* Icon Container - Auto Active Styles */}
                  <div
                    className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-700 ease-out 
                                ${
                                  isActive
                                    ? 'border-transparent text-black bg-[#9CFF3A]'
                                    : 'border-gray-200 text-gray-400 group-hover:border-transparent group-hover:text-black group-hover:bg-[#9CFF3A]'
                                }
                            `}
                  >
                    <div className='w-6 h-6'>
                      {(() => {
                        const Icon = icons[idx] || icons[0]
                        return <Icon />
                      })()}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-xs transition-colors duration-300 ${isActive ? 'text-black' : 'text-gray-300 group-hover:text-black'}`}
                  >
                    0{idx + 1}
                  </span>
                </div>

                <h4
                  className={`text-xl md:text-2xl font-bold text-gray-900 mb-4 transition-transform duration-500 whitespace-pre-line ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}
                >
                  {item.title}
                </h4>
                <p
                  className={`text-gray-500 font-normal text-base md:text-lg transition-colors duration-500 ${isActive ? 'text-gray-900' : 'group-hover:text-gray-700'}`}
                >
                  {item.description}
                </p>
              </Reveal>
            )
          })}
        </div>
      </div>

      {/* 
          Full Width Footer Section 
          - Updated Padding: py-12 md:py-16 to match the visual weight of the Partners section as requested.
          - This removes the excessive bottom space and creates a balanced text band.
      */}
      <div className='w-full mt-12 md:mt-5 md:pb-10 bg-gradient-to-b from-transparent to-white'>
        <div className='py-12 md:py-10 px-6 md:px-12'>
          <div className='max-w-6xl mx-auto'>
            {/* Horizontal Layout: Logo + Text */}
            <div className='flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3'>
              {hasTiko && (
                <span className='inline-flex items-center shrink-0'>
                  {/* Updated: Logo Colors for White Background (fill="black") */}

                  {/* height: 33px*/}
                  <TikoLogo className='h-[33px] md:h-[33px]' />
                </span>
              )}

              <div className='text-center md:text-left'>
                <SplitText
                  text={cleanText}
                  className='text-xl md:text-2xl font-medium'
                  delay={30}
                  duration={1.25}
                  ease='power3.out'
                  splitType='chars'
                  from={{ opacity: 1, y: 0, color: '#d1d5db' }}
                  to={{ opacity: 1, y: 0, color: '#000000' }}
                  threshold={0.1}
                  rootMargin='-50px'
                  textAlign='center'
                  onLetterAnimationComplete={handleAnimationComplete}
                  showCallback
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
