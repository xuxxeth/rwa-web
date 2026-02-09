import React, { useRef, useState, useEffect } from 'react'
import { Section } from './ui/Section'
import { useTranslation, Trans } from '@/hooks/useTranslation'
import { Reveal } from './ui/Reveal'
import { HighlightText } from './ui/HighlightText'
import {
  DualLicenseIcon,
  NativeComplianceIcon,
  KycRiskIcon,
  DualAuditIcon,
  BgIconVariant1,
  BgIconVariant2,
  BgIconVariant3,
  BgIconVariant4,
} from './ui/ComplianceIcons'

interface ComplianceItem {
  title: string
  description: string
}

export const Compliance: React.FC = () => {
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

  const icons = [DualLicenseIcon, NativeComplianceIcon, KycRiskIcon, DualAuditIcon]

  return (
    <Section id='compliance' className='bg-[#F8FAFC] relative !pb-[80px]'>
      <div className='w-full max-w-6xl mx-auto pointer-events-auto relative z-10'>
        <Reveal>
          <h2
            ref={titleRef}
            className='text-2xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-16 tracking-tight whitespace-pre-line !leading-[1.3]'
          >
            <Trans
              i18nKey='compliance.title'
              t={t}
              components={{
                1: <HighlightText isVisible={isTitleVisible} delay='delay-500' />,
                2: <HighlightText isVisible={isTitleVisible} delay='delay-[1300ms]' />,
              }}
            />
          </h2>
        </Reveal>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch'>
          {(t('compliance.items', { returnObjects: true }) as ComplianceItem[]).map((item, idx) => {
            const variant = (idx + 1) as 1 | 2 | 3 | 4
            const Icon = icons[idx] || icons[0]

            return (
              <Reveal key={idx} delay={100 + idx * 100} className='h-full'>
                <GlassCard
                  icon={<Icon />}
                  title={item.title}
                  desc={item.description}
                  variant={variant}
                />
              </Reveal>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

interface GlassCardProps {
  icon: React.ReactNode
  title: string
  desc: string
  variant: 1 | 2 | 3 | 4
}

const GlassCard: React.FC<GlassCardProps> = ({ icon, title, desc, variant }) => {
  const divRef = useRef<HTMLDivElement>(null)
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return

    const div = divRef.current
    const rect = div.getBoundingClientRect()

    div.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    div.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className='relative h-full p-8 rounded-2xl bg-white border border-gray-100/50 shadow-sm overflow-hidden group transition-all duration-500 flex flex-col hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1'
    >
      {/* Hover Spotlight Effect */}
      <div
        className='pointer-events-none absolute inset-0 transition-opacity duration-500 z-0'
        style={{
          opacity,
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(156, 255, 58, 0.08), transparent 40%)`,
        }}
      />

      {/* Border Spotlight */}
      <div
        className='pointer-events-none absolute inset-0 rounded-2xl border border-[#9CFF3A] transition-opacity duration-500 z-0'
        style={{
          opacity,
          WebkitMaskImage: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
          maskImage: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
        }}
      />

      {/* Background Geometric Decor */}
      <div className='absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 z-0 text-black'>
        {variant === 1 && <BgIconVariant1 />}
        {variant === 2 && <BgIconVariant2 />}
        {variant === 3 && <BgIconVariant3 />}
        {variant === 4 && <BgIconVariant4 />}
      </div>

      <div className='relative z-10 flex items-start justify-between mb-8'>
        <div className='w-12 h-12 flex items-center justify-center text-gray-900 group-hover:text-black transition-all duration-300'>
          <div className='w-full h-full text-current'>{icon}</div>
        </div>
        <div className='text-xs font-mono text-gray-300 tracking-widest group-hover:text-[#9CFF3A] transition-colors'>
          / 0{variant}
        </div>
      </div>

      <div className='relative z-10 flex flex-col flex-grow'>
        <h3 className='text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight group-hover:text-[#6EBC14] transition-colors duration-300'>
          {title}
        </h3>
        <p className='text-gray-500 text-base md:text-lg tracking-wide flex-grow font-light'>
          {desc}
        </p>
      </div>
    </div>
  )
}
