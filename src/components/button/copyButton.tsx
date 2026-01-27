import CopySVG from '@/assets/portfolio/copy.svg?react'
import IconWithTooltip from '@/components/icon-tooltip'
import { useState } from 'react'

function CopyButton(props: { className?: string; copyText: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  return (
    <IconWithTooltip
      tooltip={isCopied ? 'copied' : 'copy'}
      tooltipClassName={'px-2 py-1'}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <CopySVG
        onClick={async (ev: React.MouseEvent) => {
          ev.stopPropagation()
          if (!isCopied) {
            await navigator.clipboard.writeText(props.copyText)
            setIsCopied(true)
            setIsOpen(true)

            setTimeout(() => {
              setIsCopied(false)
              setIsOpen(false)
            }, 3000)
          }
        }}
        className='w-3 h-3 text-gray-400 hover:text-white'
      />
    </IconWithTooltip>
  )
}

export default CopyButton
