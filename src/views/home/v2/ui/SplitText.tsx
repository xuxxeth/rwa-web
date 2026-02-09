import React, { useEffect, useRef, useState } from 'react'

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  ease?: string
  splitType?: 'chars' | 'words' | 'lines'
  from?: { opacity?: number; y?: number; x?: number; color?: string }
  to?: { opacity?: number; y?: number; x?: number; color?: string }
  threshold?: number
  rootMargin?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify' | 'start' | 'end'
  onLetterAnimationComplete?: () => void
  showCallback?: boolean
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'cubic-bezier(0.215, 0.61, 0.355, 1)', // Default approximation for power3.out
  splitType = 'chars',
  from = { opacity: 0, y: 40, x: 0, color: undefined },
  to = { opacity: 1, y: 0, x: 0, color: undefined },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete,
}) => {
  const [inView, setInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Map GSAP-like ease strings to CSS cubic-bezier
  const getTimingFunction = (easeStr: string) => {
    if (easeStr === 'power3.out') return 'cubic-bezier(0.215, 0.61, 0.355, 1)'
    if (easeStr === 'power2.out') return 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    if (easeStr === 'linear') return 'linear'
    return easeStr // Fallback to provided string (e.g., 'ease-out')
  }

  const timingFunc = getTimingFunction(ease)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  // Handle completion callback
  useEffect(() => {
    if (inView && onLetterAnimationComplete) {
      const totalTime = text.length * delay + duration * 1000
      const timer = setTimeout(() => {
        onLetterAnimationComplete()
      }, totalTime)
      return () => clearTimeout(timer)
    }
  }, [inView, text.length, delay, duration, onLetterAnimationComplete])

  const items = splitType === 'chars' ? text.split('') : text.split(' ')

  return (
    <div ref={containerRef} className={className} style={{ textAlign }} aria-label={text}>
      {items.map((item, index) => {
        // For words, we need to add a space back unless it's the last one
        const content =
          splitType === 'chars' ? item : index === items.length - 1 ? item : `${item} `

        // Handle spaces in char mode to ensure they have width
        if (splitType === 'chars' && item === ' ') {
          return (
            <span key={index} style={{ display: 'inline-block', width: '0.25em' }}>
              &nbsp;
            </span>
          )
        }

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              opacity: inView ? (to.opacity ?? 1) : (from.opacity ?? 0),
              transform: inView
                ? `translate(${to.x ?? 0}px, ${to.y ?? 0}px)`
                : `translate(${from.x ?? 0}px, ${from.y ?? 0}px)`,
              color: inView && to.color ? to.color : (from.color ?? 'inherit'),
              transitionProperty: 'opacity, transform, color',
              transitionDuration: `${duration}s`,
              transitionTimingFunction: timingFunc,
              transitionDelay: `${index * delay}ms`,
              willChange: 'transform, opacity, color',
            }}
          >
            {content}
          </span>
        )
      })}
    </div>
  )
}

export default SplitText
