import { BetweenText } from "@/components/between-text"
import IconWithTooltip from "@/components/icon-tooltip"
import { LazyImage } from "@/components/image/LazyImage"
import { LabelWrap } from "@/components/markets/Klinebody"
import { DEFAULT_SLIPPAGE } from "@/config/constants"
import { useRwaPrice } from "@/hooks/useTokenBalances"
import { useTranslation } from "@/hooks/useTranslation"
import { SessionType, TradeType } from "ca-common-web"
import { memo } from "react"

type EstimatedInfoProps = {
  estimatedFee: string
  networkFeeInNative: string
  expires: number,
  tradeType: TradeType
  slippage: number,
  maxSlippage: string,
  onEdit?: () => void
}

const EstimatedInfo = memo(
  ({ estimatedFee, networkFeeInNative, tradeType, slippage, maxSlippage, onEdit }: EstimatedInfoProps) => {
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
        {
          tradeType === TradeType.MARKET && (
            <BetweenText 
              left={
                <LabelWrap tooltip={
                  <div className="text-xs ">
                    <div className="text-white mt-1">{t('v3.t2')}</div>
                    <div className="text-[#C7CCD6] mt-1">{t('v3.t6')}</div>
                    {/* <div className="mt-1">{t('v3.t7', { slippage: Number(maxSlippage) * 100 })}</div>
                    <div className="mt-1">{t('v3.t8', { slippage: maxSlippage })}</div> */}
                    {/* <div className="mt-1 flex items-center cursor-pointer">
                      <div className="text-[#009DFF]">{t('v3.t9')}</div>
                      <img src="/images/v2/icons/link-active.png" className="w-[14px] ml-1" alt="" />
                    </div> */}
                  </div>
                }>
                  {t('v3.t2')}
                </LabelWrap>
              }
              right={
                <div className="flex items-center cursor-pointer"
                  onClick={() => {
                    onEdit && onEdit()
                  }}
                >
                  {`${slippage}%`}{slippage === DEFAULT_SLIPPAGE && ` (${t('v3.t3')})`}
                  <LazyImage src="/images/v2/icons/edit.png" className="w-2 h-2 ml-[4px]" />
                </div>
              }
            />
          )
        }
        {
          tradeType === TradeType.LIMIT && (
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
          )
        }
        
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