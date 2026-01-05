import QRCodeStyling from 'qr-code-styling'
import { useEffect, useRef } from 'react'

interface QRCodeProps {
  value: string
  size?: number
  margin?: number
  className?: string
}

const QRCode = ({ value, size = 200, margin = 0, className }: QRCodeProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const qrCode = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: size,
      height: size,
      data: value,
      margin,
      type: 'svg',
      dotsOptions: {
        color: '#000000',
        type: 'square',
      },
      backgroundOptions: {
        color: '#fff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 0,
      },
    })
    if (ref.current) {
      qrCode.current.append(ref.current)
    }
  }, [])

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({
        data: value,
        width: size,
        height: size,
        margin,
      })
    }
  }, [value, size, margin])

  return <div ref={ref} className={className}></div>
}

export default QRCode
