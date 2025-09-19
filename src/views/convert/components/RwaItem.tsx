import { LazyImage } from "@/components/image/LazyImage"
import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo, useMemo } from "react"

type RwaItemProps = {
  stock: string,
  rwa: string,
  icon: string,
  price: string,
  up: string,
  lock?: Number
}

const RwaItem = memo(
  ({ data }: { data: RwaItemProps}) => {
    const { t } = useTranslation()
    const upAmount = useMemo(() => Number(data.up), [data])
    
    return (
      <div className="bg-[rgba(255,255,255,0.04)] rounded-[8px] p-8 text-white">
        <div className=" flex justify-between">
          <img src={data.icon} className="w-[46px] h-[46px] rounded-full" alt={data.rwa} />
          {
            data.lock && 
              <div className="flex items-center h-[20px] px-1 text-[12px] font-medium gap-x-1 bg-[rgba(255,255,255,0.1)] rounded-[4px]">
                <LazyImage src="/images/convert/trade_lock.png" className="w-[16px] h-[16px]" />
                <span>{t('Trading Halt')}</span>
              </div>
          }
        </div>
        <div className="mt-1 text-[20px] font-medium">{data.rwa}</div>
        <div className=" font-normal text-[14px] text-[rgba(255,255,255,0.8)]">{data.stock}</div>
        <div className="mt-4 flex items-center gap-x-2">
          <div className=" text-[22px] font-medium">${data.price}</div>
          <div className={cn(
            "h-[29px] rounded-[4px] bg-[rgba(255,255,255,0.1)] py-1 px-2 flex items-center justify-center font-normal text-[14px]",
            upAmount > 0 ? 'text-[#50E3C2]' : 'text-[#E3507A]'
          )}>
            <LazyImage src={upAmount > 0 ? '/images/convert/price_up.png' : '/images/convert/price_down.png'} className="w-[6px] mr-1" />
            {Math.abs(upAmount)}%
          </div>
        </div>
      </div>
    )
  }
)

export { RwaItem }