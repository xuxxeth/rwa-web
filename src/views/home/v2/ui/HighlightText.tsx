import React from 'react'
import { cn } from '@/utils'

interface HighlightProps {
  isVisible: boolean
  delay: string
  children?: React.ReactNode
  className?: string
  svgClassName?: string
}

export const HighlightText: React.FC<HighlightProps> = ({
  isVisible,
  delay,
  children,
  className,
  svgClassName,
}) => {
  return (
    <span className={`relative inline-block text-[#9CFF3A] ${className || 'mx-1'}`}>
      {children}
      <svg
        className={cn(
          `absolute -bottom-1 left-0 w-full h-[12px] pointer-events-none transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`,
          svgClassName
        )}
        viewBox='0 0 100 15'
        preserveAspectRatio='none'
      >
        <path
          d='M2 10 Q 50 14, 98 4'
          fill='none'
          stroke='#9CFF3A'
          strokeWidth='3'
          strokeLinecap='round'
          strokeDasharray='100'
          strokeDashoffset={isVisible ? '0' : '100'}
          className={`transition-all duration-[1.5s] ease-out ${delay}`}
        />
      </svg>
    </span>
  )
}
