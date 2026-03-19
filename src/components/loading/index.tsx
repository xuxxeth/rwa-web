import { useTranslation } from '@/hooks/useTranslation'
import SpinSVG from './spin.svg?react'
import { cn } from '@/utils'
import { useEffect, useState } from 'react'
import { CA_LANGUAGE } from '@/config/constants'
import storage from '@/utils/storage'

const Loading = () => {
  const [localLanguage, setLocalLanguage] = useState('')
  useEffect(() => {
    setLocalLanguage(storage.getItem(CA_LANGUAGE) || 'en')
  }, [])
  return (
    <div className=' flex flex-col justify-center items-center'>
      <img src='/images/icons/loading-white.png' className='w-[32px] h-[32px] animate-spin' />
      <div className=' text-white text-[14px] font-normal mt-2'>{ localLanguage ? localLanguage === 'zh' ? '加载中...' : 'Loading...' : ' ' }</div>
    </div>
  )
}

export { Loading }

// 旋转 loading 图标
export function SpinLoading(props: { className?: string }) {
  return <SpinSVG className={cn('animate-spin duration-2000', props.className)} />
}

// 环形 Loading (一直转圈)
export function CircleLoading({
  size = 20,
  strokeWidth = 2,
  className,
}: {
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  // 显示 1/4 圆弧
  const offset = circumference * 0.75

  return (
    <svg
      width={size}
      height={size}
      className={cn('animate-spin duration-[1200ms]', className)}
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* 背景轨道 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke='currentColor'
        strokeWidth={strokeWidth}
        fill='none'
        className='opacity-20'
      />
      {/* 高亮圆弧 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke='currentColor'
        strokeWidth={strokeWidth}
        fill='none'
        strokeLinecap='round'
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  )
}

// 环形进度条
export function CircularProgress({
  progress = 0,
  size = 40,
  strokeWidth = 3,
  className = '',
}: {
  progress?: number
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className='transform -rotate-90'>
        {/* 背景圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='currentColor'
          strokeWidth={strokeWidth}
          fill='none'
          className='text-gray-200 opacity-50'
        />
        {/* 进度圆环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='currentColor'
          strokeWidth={strokeWidth}
          fill='none'
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className='text-blue-500 transition-all duration-300 ease-out'
        />
      </svg>
      {/* 进度文本 */}
      <span className='absolute text-xs font-normal text-60'>
        <span className='text-white'>{Math.round(progress)}</span>%
      </span>
    </div>
  )
}
