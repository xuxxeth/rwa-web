import { LazyImage } from "@/components/image/LazyImage"
import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo, useState } from "react"

const FAQItem = memo(
  () => {
    const [expand, setExpand] = useState(false)
    return (
      <div className="bg-[rgba(255,255,255,0.08)] rounded-[8px]">
        <div className="h-[56px] p-4 text-white font-semibold text-[16px] flex items-center justify-between cursor-pointer"
          onClick={() => {
            setExpand(!expand)
          }}
        >
          What is CyberAlpha Convert?
          <button className={cn(
            "transition-transform duration-300 transform cursor-pointer",
            expand ? ' rotate-180' : ' rotate-0'
          )}>
            <LazyImage src="/images/icons/caret-down.png" 
              className={cn(
                "w-5 h-5 ",
                
              )} />
          </button>
          
        </div>
        {
          expand &&
            <div className=" text-[14px] font-normal text-[rgba(255,255,255,0.6)]  px-4 pb-4">
              CyberAlpha is a decentralized exchange (DEX) aggregator that allows you to trade crypto seamlessly across multiple blockchains. Our X Routing algorithm finds the best prices by comparing liquidity pools, splitting orders, and optimizing for fees and slippage.
            </div>
        }
      </div>
    )
  }
)

const FAQ = memo(
  () => {
    const { t } = useTranslation()
    
    return (
      <div className="mt-[60px]">
        <div className="text-[18px] font-semibold mb-8 ">{t('FAQ')}</div>
        <div className="flex flex-col gap-y-4">
          <FAQItem />
          <FAQItem />
          <FAQItem />
        </div>
        
      </div>
    )
  }
)

export { FAQ }