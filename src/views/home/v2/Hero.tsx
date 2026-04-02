import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Button } from './ui/Button'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from '@/hooks/useRouter'
import { LazyImage } from '@/components/image/LazyImage'
import { useRwaTokens } from '@/hooks/useTokens'
import {
  symbolToLower,
  textPrefix,
  formatUp,
  getUpColor,
  truncate,
  type Change,
} from '@/utils/index'
import type { IRwa } from '@/service/base/types'
import useRwaWithPriceAndUp from '@/hooks/useRwaWithPriceAndUp'
import { HighlightText } from './ui/HighlightText'

// --- Types ---
interface StockData {
  icon: string
  name: string
  symbol: string
  price: number | undefined
  up: string | undefined
  color?: string
  change: Change
  precision: number
}

// --- Constants ---
const SHOWN_STOCK_SYMBOL_PREFIX = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'TSLA', 'NFLX', 'META']

function useStockData() {
  const rwaList = useRwaTokens()

  const rwaMap = useMemo(() => {
    return new Map(rwaList.map(rwa => [symbolToLower(rwa.symbol).slice(0, -1), rwa]))
  }, [rwaList])

  const filteredRwaList = useMemo(() => {
    return SHOWN_STOCK_SYMBOL_PREFIX.map(prefix => rwaMap.get(symbolToLower(prefix))).filter(
      rwa => rwa !== undefined
    ) as IRwa[]
  }, [rwaMap])

  const rwaWithPriceAndUp = useRwaWithPriceAndUp(filteredRwaList)
  return rwaWithPriceAndUp.map(item => ({
    ...item,
    color: getUpColor(item.change),
  }))
}

// --- Sub-components ---

const HeroTitle: React.FC<{ t: any }> = ({ t }) => {
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
    <h1
      ref={titleRef}
      className='text-4xl md:text-[56px] font-bold tracking-tight text-gray-900 leading-tight md:leading-[1.15] mb-6 whitespace-pre-line relative z-[130]'
    >
      {t('hero.title_prefix')}
      <HighlightText isVisible={isTitleVisible} delay='delay-500' className='mx-2 md:mx-3'>
        {t('hero.title_highlight')}
      </HighlightText>
      {t('hero.title_suffix')}
    </h1>
  )
}

const StockCard: React.FC<{
  stock: StockData
  index: number
  centerIndex: number
  hoveredIndex: number | null
  setHoveredIndex: (index: number | null) => void
  isLoaded: boolean
  onClick: (stock: StockData) => void
}> = ({ stock, index, centerIndex, hoveredIndex, setHoveredIndex, isLoaded, onClick }) => {
  const offset = index - centerIndex
  const rotation = offset * 4
  const verticalOffset = Math.abs(offset) * 12
  const isHovered = hoveredIndex === index
  const zIndex = isHovered ? 100 : index

  return (
    <div
      className='absolute w-72 h-[400px] will-change-transform flex flex-col justify-end group outline-none pointer-events-none'
      style={{
        left: '50%',
        bottom: '0px',
        marginLeft: '-9rem',
        transformOrigin: '50% 2400px',
        transform: isLoaded
          ? `rotate(${rotation}deg) translateY(${verticalOffset}px)`
          : `rotate(0deg) translateY(600px)`,
        transition: 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1.2)',
        zIndex,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <div
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        onClick={() => onClick(stock)}
        className={`
          w-full h-[180px] glass-card rounded-[2rem] p-6 
          border border-white/60 flex flex-col justify-between
          transition-all duration-300 ease-out will-change-transform
          cursor-pointer pointer-events-auto
          relative
        `}
        style={{
          transform: isHovered
            ? `translateY(-80px) scale(1.15) rotate(${-rotation}deg)`
            : 'translateY(0) scale(1) rotate(0deg)',
          boxShadow: isHovered
            ? '-30px 40px 60px -10px rgba(0,0,0,0.15), 0 0 40px 0 rgba(156, 255, 58, 0.4)'
            : '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm'>
            <LazyImage src={stock.icon} alt={stock.name} />
          </div>
          <div className='text-left'>
            <div className='font-bold text-gray-900 text-lg'>{stock.name}</div>
            <div className='text-xs text-gray-400 font-medium'>{stock.symbol}</div>
          </div>
        </div>
        <div className='flex justify-between items-end'>
          <div className={`text-3xl font-medium ${stock.color} text-gray-900 tracking-tight`}>
            {stock.price ? textPrefix(truncate(stock.price, stock.precision), '$') : ''}
          </div>
          <div className={`text-sm font-bold ${stock.color} bg-white/50 px-2 py-1 rounded-lg`}>
            {stock.up ? formatUp(stock.up) : ''}
          </div>
        </div>
        <div
          className={`absolute top-full left-0 w-full h-[60px] bg-transparent z-[-1] ${isHovered ? 'pointer-events-auto' : 'pointer-events-none'}`}
        />
      </div>
    </div>
  )
}

// --- Main Component ---

export const Hero: React.FC = () => {
  const { t } = useTranslation('home')
  const router = useRouter()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const stockData = useStockData()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const centerIndex = Math.floor(stockData.length / 2)

  const handleClick = useCallback((rwa: IRwa) => {
    router.push('/trade/' + rwa.symbol)
  }, [])

  return (
    <div className='relative z-20 pt-24 pb-10 md:pt-42 md:pb-10 px-6 !overflow-visible'>
      <div className='max-w-7xl mx-auto flex flex-col items-center text-center'>
        <HeroTitle t={t} />

        <p className='text-lg font-normal md:text-xl text-gray-500 mb-8 max-w-3xl mx-auto whitespace-pre-line relative z-[130]'>
          {t('hero.subtitle')}
        </p>

        <div className='flex flex-col sm:flex-row items-center gap-6 relative z-[130]'>
          <a onClick={() => router.push('/trade')} className='w-full sm:w-auto'>
            <Button size='lg' className='w-full px-12 group shadow-xl shadow-brand/20'>
              {t('hero.cta')}
            </Button>
          </a>
        </div>

        {/* Desktop Cards */}
        <div className='mt-[-190px] relative w-full h-[450px] flex justify-center items-end hidden md:flex perspective-1000 pointer-events-none'>
          {stockData.map((stock, idx) => (
            <StockCard
              key={stock.name}
              stock={stock}
              index={idx}
              centerIndex={centerIndex}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
              isLoaded={isLoaded}
              onClick={() => handleClick(stock)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
