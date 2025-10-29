import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo, useEffect } from "react"
import { StatisticsItem } from "./StatisticsItem"
import { useTradeStore } from "@/stores/tradeStore"
import { shortenAddress } from "@/utils"
import CopyButton from "../button/copyButton"
import { useChainById } from "@/hooks/useChain"
import { LazyImage } from "../image/LazyImage"
import { baseApi } from "@/service/base/api"

const Statistics = memo(
  ({ from }: {from?: string}) => {
    const { t } = useTranslation()
    const itemClass = from === 'market' ? 'text-[16px]' : ''
    const inputToken = useTradeStore(state => state.inputToken)
    const chain = useChainById(inputToken?.chainId)

    useEffect(() => {
      if (inputToken) {
        baseApi.getStatistic(inputToken.stockId)
          .then(res => {
            console.log(res, 22222222)
          })
      }
      
    }, [inputToken])

    return (
      <div>
        <div className=" mt-6 font-medium text-[18px] mb-2">{t('Statistics')}</div>
        <div className={cn(
          " grid gap-x-4",
          from === 'market' ? " grid-cols-4" : "grid-cols-[1fr_1fr_1fr_1.5fr]"
        )}>
          <StatisticsItem className={cn(
            "border-t",
            itemClass
          )} label={t('Mkt Cap')}>{'1372.35B'}</StatisticsItem>
          <StatisticsItem className={cn(
            "border-t",
            itemClass
          )} label={t('Total Share')}>{'3.22B'}</StatisticsItem>
          <StatisticsItem className={cn(
            "border-t",
            itemClass
          )} label={t('Circ. Shares')}>{'2.80B'}</StatisticsItem>
          <StatisticsItem className={cn(
            "border-t",
            itemClass
          )} label={t('Circ. Cap')}>{'1194.40B'}</StatisticsItem>
          <StatisticsItem className={cn(
            itemClass
          )} label={t('P/E (TTM)')}>{'230.96'}</StatisticsItem>
          <StatisticsItem className={cn(
            itemClass
          )} label={t('P/E (Static)')}>{'191.86'}</StatisticsItem>
          <StatisticsItem className={cn(
            itemClass
          )} label={t('P/B')}>{'17.75'}</StatisticsItem>
          <StatisticsItem className={cn(
            itemClass
          )} label={t('Onchain Address')}>
            <div className="flex items-center gap-x-2">
              {chain && <LazyImage src={chain.icon} className="w-[16px] h-[16px]" />}
              {shortenAddress(inputToken?.address || '') }
              <CopyButton copyText={inputToken?.address || ''} />  
            </div></StatisticsItem>
        </div>
      </div>
      
    )
  }
)

export { Statistics }