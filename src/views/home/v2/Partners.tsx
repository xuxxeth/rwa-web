import React from 'react'
import { Section } from './ui/Section'
import { useTranslation } from '@/hooks/useTranslation'
import { ArrowUpRight } from 'lucide-react'

export const Partners: React.FC = () => {
  const { t } = useTranslation('home')

  const partnersData = [
    {
      name: 'uSMART',
      fontStyle: 'font-semibold tracking-tight',
      url: 'https://www.usmart.sg',
    },
    {
      name: 'SlowMist',
      fontStyle: 'font-semibold tracking-wide',
      url: 'https://slowmist.com',
    },
    {
      name: 'PYTH',
      fontStyle: 'font-semibold tracking-widest',
      url: 'https://www.pyth.network',
    },
    {
      name: 'MEGVII',
      fontStyle: 'font-bold tracking-wider',
      url: 'https://faceplusplus.com.cn',
    },
    {
      name: 'Arisk',
      fontStyle: 'font-bold tracking-normal',
      url: 'https://arisk.io',
    },
  ]

  // Repeat the data to ensure the marquee fills the screen width regardless of screen size
  // 5 items * 150px = 750px. 1920px screen needs at least 3 sets (2250px) to scroll smoothly without gaps.
  const repeatedPartners = [...partnersData, ...partnersData, ...partnersData, ...partnersData]

  const PartnerCard = ({
    partner,
    idx,
    roleIdx,
    isClone = false,
  }: {
    partner: (typeof partnersData)[0]
    idx: number
    roleIdx: number
    isClone?: boolean
  }) => {
    const roles = t('partners.roles', { returnObjects: true }) as string[]

    return (
      <a
        href={partner.url}
        target='_blank'
        rel='noopener noreferrer'
        className='
          group relative flex flex-col items-center justify-center 
          w-[120px] md:w-[150px] h-8 md:h-12
          cursor-pointer shrink-0 select-none
        '
      >
        {/* Top Right Arrow - Adjusted position for better visibility in smaller card */}
        <div className='absolute top-1 right-2 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300 text-black z-10'>
          <ArrowUpRight size={12} strokeWidth={2.5} />
        </div>

        {/* Content Wrapper */}
        <div className='flex flex-col items-center justify-center relative w-full'>
          {/* Name / Logo Text */}
          <div className='transform transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:scale-105 will-change-transform'>
            <span
              className={`
                  text-sm md:text-lg text-gray-700 
                  group-hover:text-black 
                  transition-all duration-300 
                  ${partner.fontStyle}
              `}
            >
              {partner.name}
            </span>
          </div>

          {/* Role Text - Revealed on Hover */}
          <div
            className='
            absolute top-full left-1/2 -translate-x-1/2 w-[120%] text-center
            opacity-0 transform translate-y-[-4px] scale-95
            group-hover:opacity-100 group-hover:translate-y-1 group-hover:scale-100
            transition-all duration-500 ease-out
          '
          >
            <span className='block text-[8px] md:text-[9px] font-semibold text-gray-500 tracking-widest uppercase leading-tight whitespace-normal'>
              {roles[roleIdx % roles.length]}
            </span>
          </div>
        </div>
      </a>
    )
  }

  return (
    // Updated padding to !py-7 (28px) to reduce height by 20px from previous !py-12 (48px)
    <Section id='partners' className='!py-7 overflow-hidden bg-transparent'>
      <div className='max-w-full'>
        <div
          // Changed py-8 to py-6 to reduce vertical space but still kept enough for hover text
          className='w-full inline-flex flex-nowrap overflow-hidden py-6 [mask-image:_linear-gradient(to_right,transparent_0,_black_64px,_black_calc(100%-64px),transparent_100%)] group/list'
        >
          {/* List 1 */}
          <ul className='flex items-center justify-center md:justify-start [&_li]:mx-2 animate-loop-scroll group-hover/list:[animation-play-state:paused]'>
            {repeatedPartners.map((partner, idx) => (
              <li key={`orig-${idx}`}>
                <PartnerCard partner={partner} idx={idx} roleIdx={idx} />
              </li>
            ))}
          </ul>
          {/* List 2 (Clone) */}
          <ul
            className='flex items-center justify-center md:justify-start [&_li]:mx-2 animate-loop-scroll group-hover/list:[animation-play-state:paused]'
            aria-hidden='true'
          >
            {repeatedPartners.map((partner, idx) => (
              <li key={`clone-${idx}`}>
                <PartnerCard partner={partner} idx={idx} roleIdx={idx} isClone />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
