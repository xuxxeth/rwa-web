import { BetweenText } from "@/components/between-text"
import { LazyImage } from "@/components/image/LazyImage"
import { useTranslation } from "@/hooks/useTranslation"
import { memo } from "react"

const EstimatedInfo = memo(
  () => {
    const { t } = useTranslation()
    return (
      <div className="bg-[rgba(6,7,10,0.3)] rounded-[16px] p-4 mt-4 text-white font-normal text-[14px] flex flex-col gap-y-2">
        {/* <BetweenText 
          left={<div className="flex items-center">
                {t('Rete')}
                  <LazyImage src="/images/icons/info.png" className="w-[15px] ml-1" />
                </div>
          }
          right={'0.485049404 AMZNc'}
        /> */}
        <BetweenText 
          left={t('Rate')}
          right={
            <div className="flex items-center">
              <button className=" cursor-pointer">
                <LazyImage src="/images/icons/refresh.png" className="w-[10px] mr-1" />
              </button>
              <span>1 APPLc = 202.00 USDT</span>
            </div>
          }
        />
        <BetweenText 
          left={t('Network Fee')}
          right={'0.015 BNB'}
        />
        <BetweenText 
          left={t('Expires in')}
          right={'7 days'}
        />
      </div>
    )
  }
)

export { EstimatedInfo }