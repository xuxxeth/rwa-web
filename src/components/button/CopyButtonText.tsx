import IconWithTooltip from '@/components/icon-tooltip'
import { useState, type ReactNode } from 'react'

function CopyButtonText(props: { className?: string; copyText: string, children?: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  return (
    <IconWithTooltip
      tooltip={isCopied ? 'copied' : 'copy'}
      tooltipClassName={'px-2 py-1'}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <span
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
        className={props.className}
      >{ props.children} </span>
    </IconWithTooltip>
  )
}

export default CopyButtonText
