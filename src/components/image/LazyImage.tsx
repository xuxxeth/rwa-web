import { useEffect, useRef, useState } from 'react'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  placeholder?: string // 占位图
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, placeholder, alt = '', ...props }) => {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [visible, setVisible] = useState(false) // 是否进入视口
  const [loaded, setLoaded] = useState(false) // 是否已加载完成

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [])

  if (!src && !placeholder) return null

  return (
    <img
      ref={imgRef}
      src={visible ? src : placeholder}
      alt={alt}
      onLoad={() => setLoaded(true)}
      style={{
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.6s ease-in-out',
        display: 'block',
      }}
      {...props}
    />
  )
}
