import { BetweenText } from "@/components/between-text"
import { LazyImage } from "@/components/image/LazyImage"
import { useRwaPrice } from "@/hooks/useTokenBalances"
import { useTranslation } from "@/hooks/useTranslation"
import { memo } from "react"

type EstimatedInfoProps = {
  estimatedFee: string
  networkFeeInNative: string
  expires: number,
  onEdit?: () => void
}

const EstimatedInfo = memo(
  ({ estimatedFee, networkFeeInNative, onEdit }: EstimatedInfoProps) => {
    const { t } = useTranslation()
    // const inputTokenPrice = useRwaPrice(inputToken?.symbol || '')
    return (
      <div className="pt-3 mt-2 text-white font-normal text-[14px] flex flex-col gap-y-2">
        
        {/* <BetweenText 
          left={t("Rate")}
          right={
            <div className="flex items-center">
              <button className=" cursor-pointer">
                <LazyImage src="/images/icons/refresh.png" className="w-[10px] mr-1" />
              </button>
              <span>1 {inputToken?.symbol || '-'} = {inputTokenPrice?.price || '--'} {outputToken?.symbol || '--'}</span>
            </div>
          }
        /> */}
        <BetweenText 
          left={t("Expires in")}
          right={
            <div className=""
              onClick={() => {
                // onEdit && onEdit()
              }}
            >
              {t('assets.order.intraday')} 
              {/* <LazyImage src="/images/icons/edit.png" className="w-3 h-3 ml-[10px]" /> */}
            </div>
          }
        />
        <BetweenText 
          left={t('v2.tx.t28')}
          right={`${estimatedFee} USDT` }
        />
        <BetweenText 
          left={t("Network Fee")}
          right={`${networkFeeInNative} BNB` }
        />
        
      </div>
    )
  }
)

export { EstimatedInfo }