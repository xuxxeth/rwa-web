import { useTranslation } from '@/hooks/useTranslation'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useTradeStore } from '@/stores/tradeStore'
import { divide, formatLargeNumber, multiply, shortenAddress, toFixed } from '@/utils'
import { useChainById } from '@/hooks/useChain'
import { baseApi } from '@/service/base/api'
import type { IStatistic } from '@/service/base/types'

import { useStockStore } from '@/stores/stockStore'
import IconWithTooltip from '@/components/icon-tooltip'

const Statistics = memo(({ from }: { from?: string }) => {
  const { t } = useTranslation()
  const inputToken = useTradeStore(state => state.inputToken)
  const setStockData = useStockStore(state => state.setStockData)
  const rwaPrice = useTradeStore(state => state.realtimeRwaData)

  const [statisticData, setStatisticData] = useState<IStatistic>()
  const unit = '1000000'

  const capData = useMemo(() => {
    let _data = {
      marketCap: '--',
      circCap: '--',
      peTtm: '--',
      peStatic: '--',
      pb: '--',
    }
    if (statisticData?.totalShare && rwaPrice?.p) {
      // 总市值 = 当前股价 * 总股本
      _data.marketCap = formatLargeNumber(multiply(statisticData.totalShare, rwaPrice.p))
      // 流通市值 = 当前股价 * 流通股本
      _data.circCap = formatLargeNumber(multiply(statisticData.circShare, rwaPrice.p))
      // _data.peTtm = formatLargeNumber(
      //   divide(multiply(statisticData.totalShare, rwaPrice.p), multiply(statisticData.netIncomeLtm, unit))
      // )
      _data.peTtm = toFixed(divide(rwaPrice.p, statisticData.epsTtm))
      // pe(static) = 总市值/ 上一个完整财年的净利润
      // _data.peStatic = formatLargeNumber(
      //   divide(multiply(statisticData.totalShare, rwaPrice.p), multiply(statisticData.netIncomeLastYear, unit))
      // )
      _data.peStatic = toFixed(divide(rwaPrice.p, statisticData.eps))
      // pb = 总市值/净资产
      _data.pb = formatLargeNumber(
        divide(multiply(statisticData.totalShare, rwaPrice.p), multiply(statisticData.netAsset, unit))
      )
    }

    return _data
  }, [statisticData, rwaPrice?.p])

  useEffect(() => {
    setStockData(capData)
  }, [capData])

  useEffect(() => {
    if (inputToken?.stockId ) {
      setStatisticData(undefined)
      baseApi.getStatistic(inputToken.stockId).then(res => {
        setStatisticData(res?.data || {})
      })
    }
  }, [inputToken?.stockId])

  return (
    <div className='bg-gray-900 rounded-[6px] p-3'>
      <div className='text-sm/[23px] font-normal mb-2'>{t('companyProfile.fundamental')}</div>
      <div>
        {[
          {
            title: 'tso',
            value: statisticData?.totalShare ? formatLargeNumber(statisticData?.totalShare || '') : '--',
            tooltip: 'tsoH',
          },
          {
            title: 'float',
            value: statisticData?.circShare ? formatLargeNumber(statisticData?.circShare || '') : '--',
            tooltip: 'floatH',
          },
          {
            title: 'floatCap',
            value: capData?.circCap || '',
            tooltip: 'floatCapH',
          },
          {
            title: 'pe',
            // value: capData?.peStatic || '',
            value: capData?.peStatic ? parseFloat(capData.peStatic) < 0 ? t('v2.tx.t42') : capData?.peStatic : '--',
            tooltip: 'peH',
          },
          {
            title: 'pb',
            value: capData?.pb || '',
            tooltip: 'pbH',
          },
        ].map(({ title, value, tooltip }) => {
          return (
            <div key={title} className='inline-block w-[20%] text-sm/4.5 font-normal'>
              <IconWithTooltip
                tooltip={t(`companyProfile.${tooltip}`)}
                triggerClassName='inline-flex justify-start'
                tooltipClassName='px-2 py-1'
              >
                <div className='text-gray-400 border-b border-b-gray-400 border-dashed'>
                  {t(`companyProfile.${title}`)}
                </div>
              </IconWithTooltip>
              <div className='text-white mt-1'>{value}</div>
            </div>
          )
        })}
      </div>
    </div>
  )

})

export { Statistics }
