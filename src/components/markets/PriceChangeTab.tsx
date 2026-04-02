import { cn } from "@/utils/tw"
import { LazyImage } from "../image/LazyImage"
import { useCallback, useState } from "react"
import { useTranslation } from "@/hooks/useTranslation"
import { TradeType } from "ca-common-web"

const ChangeItemWrap = ({
  children,
  className,
  onClick,
  isMarket,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  isMarket?: boolean
}) => {
  return (
    <div className={cn(
      "border border-[#232427] bg-[#1A1B1E] h-[24px] flex items-center justify-center text-[12px] text-[#9DA3AF] font-normal cursor-pointer px-2",
      !isMarket && "hover:bg-[#383A40] hover:border-[#383A40] hover:text-white",
      isMarket && "border-[#232427] text-[#383A40] bg-[#131416]",
      className
    )}
      onClick={() => onClick && onClick()}
    >
      {children}
    </div>
  )
}

const ChangeItem = ({
  change,
  sy,
  className,
  onClick,
  isMarket,
}: {
  change: any
  sy: string
  className?: string
  onClick?: () => void
  isMarket?: boolean
}) => { 
  return (
    <ChangeItemWrap className={cn("w-[61px] flex items-center", className)} onClick={onClick} isMarket={isMarket}>
      <div className="w-[6px] inline-block">{sy}</div>{change.label}
    </ChangeItemWrap>
  )
}

const PriceChangeTab = ({
  onChange,
  from,
  tradeType
}: {
  onChange?: (value: number) => void
  from?: string
  tradeType?: TradeType
}) => { 
  const changes = [
    { id: 2, value: 1, label: '1%' },
    { id: 3, value: 5, label: '5%' },
    { id: 4, value: 10, label: '10%' },
  ]
  const { t } = useTranslation()
  const [action, setAction] = useState<'plus' | 'minus'>('plus')
  const isMarket = tradeType === TradeType.MARKET
  
  const handleChangePrice = useCallback((value: number) => {
    onChange && onChange(action === 'plus' ? value : -value)
  }, [action, onChange]) 

  return (
    <div className={cn(
      "flex items-center  mt-1 gap-x-1",
      from === 'lite-trade' ? ' relative' : 'justify-between'
    )}>
      <ChangeItemWrap
        className={cn(
          " ",
          from === 'lite-trade' ? 'rounded-[6px]' : 'rounded-bl-[4px] flex-1 '
        )}
        isMarket={isMarket}
        onClick={() => handleChangePrice(0)} 
      >
        <span>{t('v2.tx.t22')}</span>
      </ChangeItemWrap>
      {
        changes.map(change => (
          <ChangeItem 
            className={cn(
              "",
              from === 'lite-trade' ? 'rounded-[6px] w-[36px] ' : ''
            )}
            key={change.id} 
            change={change} 
            sy={action === 'plus' ? '+' : '-'} 
            isMarket={isMarket}
            onClick={() => handleChangePrice(change.value)}
          />
        ))
      }
      <ChangeItemWrap 
        className={cn(
          "w-[24px] px-0  ",
          from === 'lite-trade' ? 'rounded-[6px] border-[rgba(0,0,0,0)] absolute right-0 ' : 'rounded-br-[4px]'
        )}
        isMarket={isMarket}
        onClick={() => setAction(prev => prev === 'plus' ? 'minus' : 'plus')} // 优化：使用函数式更新
      >
        <img src="/images/v2/icons/swap.png" className="w-[14px] h-[14px]" style={{opacity: isMarket ? 0.4 : 1}} alt="swap" />
      </ChangeItemWrap>
    </div>
  )
}

export { PriceChangeTab }
