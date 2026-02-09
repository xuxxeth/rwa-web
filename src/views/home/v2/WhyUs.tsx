import React, { useRef, useState, useEffect } from 'react'
import { useTranslation, Trans } from '@/hooks/useTranslation'
import { Reveal } from './ui/Reveal'
import { HighlightText } from './ui/HighlightText'
import { SpeedIcon, FeeModelIcon, LiquidityIcon } from './ui/WhyUsIcons'

interface WhyUsItem {
  subLabel: string
  value: string
  title: string
  description: string
}

const WhyUs: React.FC = () => {
  const { t, i18n } = useTranslation('home')
  const language = i18n.language

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

  const splitValue = (val: string) => {
    const match = val.match(/^([$0-9.]+)(.*)$/)
    return match ? { value: match[1], suffix: match[2] } : { value: val, suffix: '' }
  }

  const icons = [SpeedIcon, FeeModelIcon, LiquidityIcon]

  return (
    // Spacing Adjustments:
    // Reduced bottom padding from pb-32 to pb-20 to pull the Trust section closer.
    <section
      id='why-us'
      className='relative w-full mt-0 pt-16 md:pt-20 pb-20 px-6 z-10 overflow-hidden bg-[#131416]'
    >
      {/* --- Premium Separator Line --- */}
      <div className='absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-20' />
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#9CFF3A]/30 to-transparent z-20 blur-[1px]' />

      {/* --- Ambient Atmosphere --- */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#9CFF3A] opacity-[0.03] blur-[150px] rounded-full pointer-events-none -translate-y-1/2 z-0' />

      <div className='max-w-7xl mx-auto relative z-10'>
        <div className='mb-16 text-center'>
          <Reveal>
            {/* Reduced title size from text-6xl to text-5xl */}
            <h2
              ref={titleRef}
              className='text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-6'
            >
              <Trans
                i18nKey='whyUs.title'
                t={t}
                components={{
                  1: (
                    <HighlightText
                      isVisible={isTitleVisible}
                      delay='delay-500'
                      className={language === 'en' ? 'mr-2' : 'mx-0'}
                    />
                  ),
                }}
              />
            </h2>
          </Reveal>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {(t('whyUs.items', { returnObjects: true }) as WhyUsItem[]).map((item, idx) => {
            const { value, suffix } = splitValue(item.value || '')
            const Icon = icons[idx] || icons[0]

            return (
              <SpotlightCard
                key={idx}
                delay={100 * (idx + 1)}
                label={item.subLabel || ''}
                value={value}
                valueSuffix={suffix}
                title={item.title}
                desc={item.description}
              >
                <Icon />
              </SpotlightCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}

interface SpotlightCardProps {
  delay: number
  label: string
  value: string
  valueSuffix: string
  title: string
  desc: string
  children: React.ReactNode
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  delay,
  label,
  value,
  valueSuffix,
  title,
  desc,
  children,
}) => {
  const divRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return

    const div = divRef.current
    const rect = div.getBoundingClientRect()

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    div.style.setProperty('--mouse-x', `${x}px`)
    div.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <Reveal delay={delay} className='h-full'>
      <div
        ref={divRef}
        onMouseMove={handleMouseMove}
        className='group relative h-[400px] p-8 rounded-3xl bg-[#1A1B1E] border border-white/5 overflow-hidden transition-all duration-500 hover:border-[#9CFF3A]/30 hover:bg-[#1A1B1E] hover:shadow-xl hover:shadow-[#9CFF3A]/10 flex flex-col justify-between'
      >
        <div
          className='pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(156, 255, 58, 0.08), transparent 40%)`,
          }}
        />

        <div className='absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500 z-0'>
          {children}
        </div>

        <div className='relative z-20 h-full flex flex-col justify-end pointer-events-none'>
          <div className='mb-auto'>
            <div className='text-[#9CFF3A] font-mono text-sm tracking-widest mb-2 opacity-80 group-hover:opacity-100 transition-opacity uppercase'>
              {label}
            </div>
          </div>
          <div>
            <h3 className='text-7xl font-bold md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-4 tracking-tighter'>
              {value}
              <span className='text-4xl text-[#9CFF3A] align-top ml-1'>{valueSuffix}</span>
            </h3>
            <h4 className='text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-[#9CFF3A] transition-colors duration-300'>
              {title}
            </h4>
            <p className='text-gray-400 text-base md:text-lg font-light group-hover:text-gray-300 transition-colors'>
              {desc}
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

export { WhyUs }
