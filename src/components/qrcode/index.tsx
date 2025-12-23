import QRCodeStyling from 'qr-code-styling'
import { useEffect, useRef } from 'react'

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

const QRCode = ({ value, size = 200, className }: QRCodeProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const qrCode = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: size,
      height: size,
      data: value,
      type: 'svg',
      dotsOptions: {
        color: '#000000',
        type: 'square',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 0,
      },
    })
  }, [])

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({
        data: value,
        width: size,
        height: size,
      })
    }
  }, [value, size])

  return <div ref={ref} className={className}></div>
}

export default QRCode
