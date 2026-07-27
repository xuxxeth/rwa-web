import { useEffect, useMemo, useRef, useState } from 'react'
import { Info, X } from 'lucide-react'
import { cn } from '@/utils'
import { LazyImage } from '../image/LazyImage'

type AnnouncementItem = {
  id: string
  title: string
  content: string
  link: string
}

const announcementDismissed = { current: false }

const mockAnnouncements: AnnouncementItem[] = [
  {
    id: '1',
    title: '这里是公告标题',
    content: '这里是公告内容，这里是公告内容这里是公告内容这里是公告内容这里是公告内容',
    link: 'https://example.com/announcement-1',
  },
  {
    id: '2',
    title: '这里是公告标题',
    content: '这里是公告内容',
    link: 'https://example.com/announcement-2',
  },
  {
    id: '3',
    title: '拆并股公告',
    content: '这里是更长的公告内容用于模拟内容不足时后续公告补位展示效果。',
    link: 'https://example.com/announcement-3',
  },
  {
    id: '4',
    title: '重要通知',
    content: '这是一条较短的公告内容。',
    link: 'https://example.com/announcement-4',
  },
  {
    id: '5',
    title: '系统维护提醒',
    content: '这里是公告内容这里是公告内容这里是公告内容。',
    link: 'https://example.com/announcement-5',
  },
]

export type AnnouncementBannerProps = {
  className?: string
  top?: number | string
}

export function AnnouncementBanner({ className, top = 60 }: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(!announcementDismissed.current)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const trackRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<number | null>(null)

  const announcements = useMemo(() => {
    return [...mockAnnouncements, ...mockAnnouncements]
  }, [])

  useEffect(() => {
    if (!isVisible) return

    if (timerRef.current) {
      window.clearInterval(timerRef.current)
    }

    timerRef.current = window.setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1
        if (nextIndex >= announcements.length) {
          setTransitionEnabled(false)
          window.requestAnimationFrame(() => {
            setCurrentIndex(0)
            window.requestAnimationFrame(() => {
              setTransitionEnabled(true)
            })
          })
          return prev
        }
        return nextIndex
      })
    }, 3000)

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!trackRef.current || !isVisible) return

    const offsets = itemRefs.current.map(item => item?.offsetLeft ?? 0)
    const currentOffset = offsets[currentIndex] ?? 0
    trackRef.current.style.transform = `translate3d(${-currentOffset}px, 0, 0)`
  }, [currentIndex, isVisible])

  if (!isVisible) return null

  return (
    <div
      className={cn(' w-full pointer-events-none bg-[#131416]', className)}
      style={{ top }}
    >
      <div className='pointer-events-auto mx-auto w-full overflow-hidden bg-[rgba(243,161,63,0.1)]'>
        <div className='relative flex h-[40px] items-center gap-3 overflow-hidden px-4 pr-11 text-[#E9E9E9]'>

          <div className='min-w-0 flex-1 overflow-hidden'>
            <div
              ref={trackRef}
              className={cn(
                'flex items-center gap-8 whitespace-nowrap',
                transitionEnabled ? 'transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]' : 'transition-none'
              )}
              style={{ transform: 'translate3d(0, 0, 0)' }}
            >
              {announcements.map((announcement, index) => (
                <button
                  key={`${announcement.id}-${index}`}
                  ref={element => {
                    itemRefs.current[index] = element
                  }}
                  type='button'
                  onClick={() => window.open(announcement.link, '_blank', 'noopener,noreferrer')}
                  className='group inline-flex max-w-[42vw] shrink-0 items-center gap-2 text-left cursor-pointer hover:opacity-90'
                >
                  <div className='w-[14px] h-[14px]'>
                    <LazyImage src='/images/icons/annouce.png' className='w-full' />
                  </div>
                  <span className='shrink-0 text-[14px] font-semibold text-[#E9E9E9]'>
                    {announcement.title}
                  </span>
                  <span className='min-w-0 truncate text-[14px] font-normal text-[#E9E9E9]'>
                    {announcement.content}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type='button'
            onClick={() => {
              announcementDismissed.current = true
              setIsVisible(false)
            }}
            className='absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#D8AE45] transition-colors hover:bg-white/5 hover:text-white'
            aria-label='关闭公告'
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementBanner
