import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils'
import { LazyImage } from '../image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'

type AnnouncementItem = {
  id: string
  title: string
  content: string
  link: string
}

const announcementDismissed = { current: false }

const mockAnnouncementsList: Record<string, AnnouncementItem[]> = {
  "zh": [
    {
      "id": "1",
      "title": "NVDA於2026年6月80日進行拆股",
      "content": "這裡是更長的公告內容，用於模擬內容不足時後續公告補位展示效果。一一一一一一一一一一一一一一一一一一",
      "link": "https://example.com/announcement-1"
    },
    {
      "id": "2",
      "title": "AAPL於2026年6月80日進行拆股",
      "content": "這裡是更長的公告內容，用於模擬內容不足時後續公告補位展示效果。二二二二二二二二二二二二二",
      "link": "https://example.com/announcement-2"
    },
    {
      "id": "3",
      "title": "微軟於2026年6月80日進行拆股",
      "content": "這裡是更長的公告內容，用於模擬內容不足時後續公告補位展示效果。三三三三三三三三三三",
      "link": "https://example.com/announcement-3"
    }
  ],
  "en": [
    {
      "id": "1",
      "title": "NVDA will conduct a stock split on June 80, 2026",
      "content": "This is longer announcement content used to simulate the display effect when additional announcements are needed to fill insufficient content. One one one one one one one one one",
      "link": "https://example.com/announcement-1"
    },
    {
      "id": "2",
      "title": "AAPL will conduct a stock split on June 80, 2026",
      "content": "This is longer announcement content used to simulate the display effect when additional announcements are needed to fill insufficient content. Two two two two two two two two two",
      "link": "https://example.com/announcement-2"
    },
    {
      "id": "3",
      "title": "Microsoft will conduct a stock split on June 80, 2026",
      "content": "This is longer announcement content used to simulate the display effect when additional announcements are needed to fill insufficient content. Three three three three three three three",
      "link": "https://example.com/announcement-3"
    }
  ]
}

const mockAnnouncements: AnnouncementItem[] = [
  {
    id: '1',
    title: 'NVDA于2026年6月80日进行拆股',
    content:
      '这里是更长的公告内容用于模拟内容不足时后续公告补位展示效果。一一一一一一一一一一一一一一一一一一',
    link: 'https://example.com/announcement-1',
  },
  {
    id: '2',
    title: 'AAPL于2026年6月80日进行拆股',
    content:
      '这里是更长的公告内容用于模拟内容不足时后续公告补位展示效果。二二二二二二二二二二二二二',
    link: 'https://example.com/announcement-2',
  },
  {
    id: '3',
    title: '微软于2026年6月80日进行拆股',
    content:
      '这里是更长的公告内容用于模拟内容不足时后续公告补位展示效果。三三三三三三三三三三',
    link: 'https://example.com/announcement-3',
  },
]

export type AnnouncementBannerProps = {
  className?: string
  top?: number | string
}

export function AnnouncementBanner({
  className,
  top = 60,
}: AnnouncementBannerProps) {
  const { t, i18n } = useTranslation()
  const [isVisible, setIsVisible] = useState(
    !announcementDismissed.current
  )
  const [isPaused, setIsPaused] = useState(false)

  const announcements = useMemo(() => {
    // 复制一份实现无缝循环
    const language = i18n.language || 'en'
    return [...mockAnnouncementsList[language]]
  }, [i18n.language])

  if (!isVisible) return null

  return (
    <div
      className={cn('w-full pointer-events-none bg-[#131416]', className)}
      style={{ top }}
    >
      <div
        className="pointer-events-auto overflow-hidden bg-[rgba(243,161,63,0.1)] pr-[50px] relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >

        <div className="relative flex h-[40px] items-center overflow-hidden px-4 pr-20 text-[#E9E9E9]">

            <div
            className="
              flex whitespace-nowrap
              animate-announcement-scroll
            "
            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
          >
            {announcements.map((announcement, index) => (
              <button
                key={`${announcement.id}-${index}`}
                type="button"
                onClick={() =>
                  window.open(
                    announcement.link,
                    '_blank',
                    'noopener,noreferrer'
                  )
                }
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  mr-8
                  max-w-[42vw]
                  text-left
                  cursor-pointer
                  hover:opacity-90
                "
              >
                <LazyImage
                  src="/images/icons/annouce.png"
                  className="h-[14px] w-[14px] max-w-none"
                />

                <span className="shrink-0 text-[14px] font-semibold">
                  {announcement.title}
                </span>

                <span className="truncate text-[14px] font-normal">
                  {announcement.content}
                </span>
              </button>
            ))}
          </div>


          

        </div>
        <button
          type="button"
          onClick={() => {
            announcementDismissed.current = true
            setIsVisible(false)
          }}
          className="
            absolute
            right-2
            top-1/2
            flex
            h-8
            w-8
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            text-white
            hover:bg-white/5
            hover:text-white
          "
        >
          <X size={16} strokeWidth={2.5} />
        </button>

      </div>
    </div>
  )
}

export default AnnouncementBanner
