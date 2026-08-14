import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils'
import { LazyImage } from '../image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'
import { useAppStore } from '@/stores/appStore'

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
    // {
    //   "id": "2",
    //   "title": "AAPL於2026年6月80日進行拆股",
    //   "content": "這裡是更長的公告內容，用於模擬內容不足時後續公告補位展示效果。二二二二二二二二二二二二二",
    //   "link": "https://example.com/announcement-2"
    // },
    // {
    //   "id": "3",
    //   "title": "微軟於2026年6月80日進行拆股",
    //   "content": "這裡是更長的公告內容，用於模擬內容不足時後續公告補位展示效果。三三三三三三三三三三",
    //   "link": "https://example.com/announcement-3"
    // }
  ],
  "en": [
    {
      "id": "1",
      "title": "NVDA will conduct a stock split on June 80, 2026",
      "content": "This is longer announcement content used to simulate the display effect when additional announcements are needed to fill insufficient content. One one one one one one one one one",
      "link": "https://example.com/announcement-1"
    },
    // {
    //   "id": "2",
    //   "title": "AAPL will conduct a stock split on June 80, 2026",
    //   "content": "This is longer announcement content used to simulate the display effect when additional announcements are needed to fill insufficient content. Two two two two two two two two two",
    //   "link": "https://example.com/announcement-2"
    // },
    // {
    //   "id": "3",
    //   "title": "Microsoft will conduct a stock split on June 80, 2026",
    //   "content": "This is longer announcement content used to simulate the display effect when additional announcements are needed to fill insufficient content. Three three three three three three three",
    //   "link": "https://example.com/announcement-3"
    // }
  ]
}


export type AnnouncementBannerProps = {
  className?: string
  top?: number | string
}

export function AnnouncementBanner({
  className,
  top = 60,
}: AnnouncementBannerProps) {
  const { i18n } = useTranslation()
  const [isVisible, setIsVisible] = useState(
    !announcementDismissed.current
  )
  const [isPaused, setIsPaused] = useState(false)
  const firstGroupRef = useRef<HTMLDivElement | null>(null)
  const [scrollDistance, setScrollDistance] = useState(0)

  const announcements = useMemo(() => {
    const language = i18n.language || 'en'
    return [...mockAnnouncementsList[language]]
  }, [i18n.language])

  const scrollDuration = useMemo(() => {
    return Math.max(announcements.length, 1) * 20
  }, [announcements.length])

  const isMarquee = announcements.length > 1
  const isSingle = announcements.length === 1

  const setShowAnnouncement = useAppStore(state => state.setShowAnnouncement)

  useEffect(() => {
    if (announcements.length > 0) {
      setShowAnnouncement(true)
    }

    if (!isMarquee) {
      setScrollDistance(0)
      return
    }

    const updateScrollDistance = () => {
      setScrollDistance(
        firstGroupRef.current?.getBoundingClientRect().width ?? 0
      )
    }

    updateScrollDistance()

    if (!firstGroupRef.current || typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(updateScrollDistance)
    observer.observe(firstGroupRef.current)

    return () => observer.disconnect()
  }, [announcements, isMarquee, setShowAnnouncement])

  if (!isVisible) return null

  return (
    <div
      className={cn('w-full pointer-events-none bg-[#131416]', className)}
      style={{ top }}
    >
      <div
        className="pointer-events-auto overflow-hidden bg-[rgba(243,161,63,0.1)] pr-[50px] relative"
        onMouseEnter={() => {
          if (isMarquee) setIsPaused(true)
        }}
        onMouseLeave={() => {
          if (isMarquee) setIsPaused(false)
        }}
      >

        <div className="relative flex h-[40px] items-center overflow-hidden px-4 pr-20 text-[#E9E9E9]">
          {isSingle ? (
            <div className="flex w-full items-center min-w-0">
              {announcements.map(announcement => (
                <button
                  key={announcement.id}
                  type="button"
                  onClick={() =>
                    window.open(
                      announcement.link,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                  className="flex w-full min-w-0 items-center gap-2 text-left cursor-pointer hover:opacity-90"
                >
                  <div className="h-[14px] w-[14px] shrink-0">
                    <LazyImage
                      src="/images/icons/annouce.png"
                      className="h-[14px] w-[14px] max-w-none"
                    />
                  </div>
                  <span className="shrink-0 text-[14px] font-medium">
                    {announcement.title}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-normal">
                    {announcement.content}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div
              className="flex w-max items-center whitespace-nowrap animate-announcement-scroll"
              style={{
                animationPlayState: isPaused ? 'paused' : 'running',
                ['--announcement-duration' as string]: `${scrollDuration}s`,
                ['--announcement-distance' as string]: `${scrollDistance}px`,
              }}
            >
              {[0, 1].map((groupIndex) => (
                <div
                  key={groupIndex}
                  ref={groupIndex === 0 ? firstGroupRef : undefined}
                  className="flex shrink-0 items-center gap-8 pr-8"
                  aria-hidden={groupIndex === 1}
                >
                  {announcements.map((announcement) => (
                    <button
                      key={`${groupIndex}-${announcement.id}`}
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
                        max-w-[42vw]
                        text-left
                        cursor-pointer
                        hover:opacity-90
                      "
                    >
                      <div className="h-[14px] w-[14px]" >
                        <LazyImage
                          src="/images/icons/annouce.png"
                          className="h-[14px] w-[14px] max-w-none"
                        />
                      </div>
                      <span className="shrink-0 text-[14px] font-medium">
                        {announcement.title}
                      </span>

                      <span className="truncate text-[14px] font-normal">
                        {announcement.content}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            announcementDismissed.current = true
            setShowAnnouncement(false)
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
