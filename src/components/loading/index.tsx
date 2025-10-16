import { useTranslation } from '@/hooks/useTranslation'
import SpinSVG from './spin.svg?react'
import { cn } from '@/utils'

const Loading = () => {
  const { t } = useTranslation()

  return (
    <div className=' flex flex-col justify-center items-center'>
      <img src='/images/icons/loading-white.png' className='w-[32px] h-[32px] animate-spin' />
      <div className=' text-white text-[14px] font-normal mt-2'>{t('Loading')}...</div>
    </div>
  )
}

export { Loading }

// 旋转 loading 图标
export function SpinLoading(props: { className?: string }) {
  return <SpinSVG className={cn('animate-spin duration-2000', props.className)} />
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
