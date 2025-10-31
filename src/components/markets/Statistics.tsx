import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo, useEffect, useRef, useState } from "react"
import { StatisticsItem } from "./StatisticsItem"
import { useTradeStore } from "@/stores/tradeStore"
import { shortenAddress } from "@/utils"
import CopyButton from "../button/copyButton"
import { useChainById } from "@/hooks/useChain"
import { LazyImage } from "../image/LazyImage"
import { baseApi } from "@/service/base/api"
import type { IStatistic } from "@/service/base/types"
import { NumberText } from "../number-text"
import { ProfileTitle } from "./ProfileTitle"

const Statistics = memo(
  ({ from }: {from?: string}) => {
    const { t } = useTranslation()
    const itemClass = from === 'market' ? 'text-[16px] py-4' : ''
    const inputToken = useTradeStore(state => state.inputToken)
    const chain = useChainById(inputToken?.chainId)
    const initRef = useRef(false)
    const [statisticData, setStatisticData] = useState<IStatistic>()

    useEffect(() => {
      if (inputToken?.stockId && !initRef.current) {
        initRef.current = true
        baseApi.getStatistic(inputToken.stockId)
          .then(res => {
            setStatisticData(res?.data || {})
          })
      }
      
    }, [inputToken?.stockId])

    return (
      <div>
        <ProfileTitle title={t('Statistics')} className=" my-6" />
        <div className={cn(
          " grid gap-x-4",
          from === 'market' ? " grid-cols-4" : "grid-cols-[1fr_1fr_1fr_1.5fr]"
        )}>
          <StatisticsItem className={cn(
            "border-t",
            itemClass
          )} label={t('Mkt Cap')}>
            <NumberText text={statisticData?.marketCap} />
          </StatisticsItem>
          <StatisticsItem className={cn(
            "border-t",
            itemClass
          )} label={t('Total Share')}>
            <NumberText text={statisticData?.totalShare} />
          </StatisticsItem>
          <StatisticsItem className={cn(
            "border-t",
            itemClass
          )} label={t('Circ. Shares')}>
            <NumberText text={statisticData?.circShare} />
          </StatisticsItem>
          <StatisticsItem className={cn(
            "border-t",
            itemClass
          )} label={t('Circ. Cap')}>
            <NumberText text={statisticData?.circCap} />
          </StatisticsItem>
          <StatisticsItem className={cn(
            itemClass
          )} label={t('P/E (TTM)')}>
            <NumberText text={statisticData?.peTtm} />
          </StatisticsItem>
          <StatisticsItem className={cn(
            itemClass
          )} label={t('P/E (Static)')}>
            <NumberText text={statisticData?.peStatic} />
          </StatisticsItem>
          <StatisticsItem className={cn(
            itemClass
          )} label={t('P/B')}>
            <NumberText text={statisticData?.pb} />
          </StatisticsItem>
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