import { BetweenText } from "@/components/between-text"
import { LazyImage } from "@/components/image/LazyImage"
import { useRwaPrice } from "@/hooks/useTokenBalances"
import { useTranslation } from "@/hooks/useTranslation"
import type { IMarket, IRwa, IToken } from "@/service/base/types"
import { memo } from "react"

type EstimatedInfoProps = {
  marketInfo: IMarket
  inputToken: IRwa | null
  outputToken: IToken | null
  expires: number,
  onEdit?: () => void
}

const EstimatedInfo = memo(
  ({ inputToken, outputToken, expires, marketInfo, onEdit }: EstimatedInfoProps) => {
    const { t } = useTranslation()
    const inputTokenPrice = useRwaPrice(inputToken?.symbol || '')
    return (
      <div className="bg-[rgba(6,7,10,0.3)] rounded-[16px] p-4 mt-2 text-white font-normal text-[14px] flex flex-col gap-y-2">
        {/* <BetweenText 
          left={<div className="flex items-center">
                {t('Rete')}
                  <LazyImage src="/images/icons/info.png" className="w-[15px] ml-1" />
                </div>
          }
          right={'0.485049404 AMZNc'}
        /> */}
        <BetweenText 
          left={t("Rate")}
          right={
            <div className="flex items-center">
              <button className=" cursor-pointer">
                <LazyImage src="/images/icons/refresh.png" className="w-[10px] mr-1" />
              </button>
              <span>1 {inputToken?.symbol || '-'} = {inputTokenPrice?.price || '--'} {outputToken?.symbol || '--'}</span>
            </div>
          }
        />
        <BetweenText 
          left={t("Network Fee")}
          right={`${marketInfo.networkFeeInNative} BNB` }
        />
        <BetweenText 
          left={t("Expires in")}
          right={
            <div className="h-[32px] flex justify-center rounded-[8px] items-center px-2 bg-[rgba(0,149,255,0.1)] text-[#0095FF] text-[14px] font-normal cursor-pointer"
              onClick={() => {
                // onEdit && onEdit()
              }}
            >
              {t('assets.order.intraday')} 
              {/* <LazyImage src="/images/icons/edit.png" className="w-3 h-3 ml-[10px]" /> */}
            </div>
          }
        />
      </div>
    )
  }
)

export { EstimatedInfo }