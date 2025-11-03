import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { memo, useEffect, useMemo, useRef, useState } from "react"
import { StatisticsItem } from "./StatisticsItem"
import { useTradeStore } from "@/stores/tradeStore"
import { divide, formatLargeNumber, multiply, shortenAddress } from "@/utils"
import CopyButton from "../button/copyButton"
import { useChainById } from "@/hooks/useChain"
import { LazyImage } from "../image/LazyImage"
import { baseApi } from "@/service/base/api"
import type { IStatistic } from "@/service/base/types"
import { NumberText } from "../number-text"
import { ProfileTitle } from "./ProfileTitle"
import { useRwaPrice } from "@/hooks/useTokenBalances"

const Statistics = memo(
  ({ from }: {from?: string}) => {
    const { t } = useTranslation()
    const itemClass = from === 'market' ? 'text-[16px] py-4' : ''
    const inputToken = useTradeStore(state => state.inputToken)
    const rwaPrice = useRwaPrice(inputToken?.symbol || '')

    const chain = useChainById(inputToken?.chainId)
    const initRef = useRef(false)
    const [statisticData, setStatisticData] = useState<IStatistic>()

    const capData = useMemo(() => {
      let _data = {
        marketCap: '--',
        circCap: '--',
        peTtm: '--',
        peStatic: '--',
        pb: '--'
      }
      if (statisticData?.totalShare && rwaPrice?.price) {
        _data.marketCap = formatLargeNumber(multiply(statisticData.totalShare, rwaPrice.price))
        _data.circCap = formatLargeNumber(multiply(statisticData.circShare, rwaPrice.price))
        _data.peTtm = formatLargeNumber(divide(multiply(statisticData.totalShare, rwaPrice.price), statisticData.netIncomeLtm))
        _data.peStatic = formatLargeNumber(divide(multiply(statisticData.totalShare, rwaPrice.price), statisticData.netIncomeLastYear))
        _data.pb = formatLargeNumber(divide(multiply(statisticData.totalShare, rwaPrice.price), statisticData.netAsset))
      }

      return _data
    }, [statisticData, rwaPrice?.price])

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
            <NumberText text={capData?.marketCap} />
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
            <NumberText text={capData?.circCap} />
          </StatisticsItem>
          <StatisticsItem className={cn(
            itemClass
          )} label={t('P/E (TTM)')}>
            <NumberText text={capData?.peTtm} />
          </StatisticsItem>
          <StatisticsItem className={cn(
            itemClass
          )} label={t('P/E (Static)')}>
            <NumberText text={capData?.peStatic} />
          </StatisticsItem>
          <StatisticsItem className={cn(
            itemClass
          )} label={t('P/B')}>
            <NumberText text={capData?.pb} />
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