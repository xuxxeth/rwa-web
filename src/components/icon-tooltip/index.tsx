import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { LazyImage } from '../image/LazyImage'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { TooltipArrow } from '@radix-ui/react-tooltip'

interface IconWithTooltipProps {
  icon?: string
  text?: string
  children?: React.ReactNode
  tooltip: React.ReactNode | string
  triggerClassName?: string
  iconOrTextClassName?: string
  tooltipClassName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function IconWithTooltip({
  icon,
  text,
  tooltip,
  children,
  triggerClassName,
  iconOrTextClassName,
  tooltipClassName,
  open,
  onOpenChange,
}: IconWithTooltipProps) {
  const { t } = useTranslation()

  const renderTrigger = () => {
    if (children) {
      return children
    }
    return (
      <>
        {text && (
          <span className={cn('text-xs font-medium text-white', iconOrTextClassName)}>
            {t(text)}
          </span>
        )}
        {icon && <LazyImage src={icon} className={cn('w-6 h-6', iconOrTextClassName)} />}
      </>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0} open={open} onOpenChange={onOpenChange}>
        <TooltipTrigger asChild>
          <div className={cn('cursor-pointer flex items-center justify-center', triggerClassName)}>
            {renderTrigger()}
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={cn(
            'px-4 py-2 rounded-[8px] bg-gray-700 text-white font-normal text-xs duration-0 animate-none max-w-[250px]',
            tooltipClassName
          )}
        >
          {typeof tooltip === 'string' ? t(tooltip) : tooltip}
          <TooltipArrow className='fill-gray-700' />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function TooltipWithBorder({
  text,
  tooltip,
  children,
  className
}: {
  text?: string,
  tooltip?: string,
  children?: React.ReactNode
  className?: string
}) {
  return (
    <IconWithTooltip tooltip={tooltip}>
      <div className={cn(
        'border-b border-dashed border-[#9DA3AF] text-[#9DA3AF] text-[12px]',
        className
      )}>
        { text || children }
      </div>
    </IconWithTooltip>
  )
}

export default IconWithTooltip
