import { useTranslation, Trans } from 'react-i18next'
import { memo, useState, useMemo } from 'react'
import { formatWithCommas } from '@/utils/format'
import AssetsTable from './AssetsTable'
import {
  useAssetsList,
  useRiskControlAssets,
  type IRiskControlAsset,
  type IAssetItem,
} from '../assetsList'
import { useRwaTokens, useTokens } from '@/hooks/useTokens'
import { LazyImage } from '@/components/image/LazyImage'
// import { cn, toFixed } from '@/utils'
import { DialogController } from '@/components/dialog/DialogController'
import AssetsPieChart, { type ChartData, COLORS } from './pieChart'
import {
  advancedSort,
  cn,
  textPrefix,
  formatLargeNumber,
  divide,
  toFixed,
  multiply,
  sum,
  truncate,
  textSuffix,
  isLess,
} from '@/utils'

function Assets({ chainId, account }: { chainId: number; account: string }) {
  const { assetsList, estimatedBalance, estimatedRwaTotalValue, estimatedStableTokenTotalValue } =
    useAssetsList(chainId, account)

  const riskControlledAssets = useRiskControlAssets(chainId, account)

  const isRiskControlled = riskControlledAssets.length > 0

  const assetsClassName = isRiskControlled ? '' : 'flex-1'

  const { t } = useTranslation()
  return (
    <div className='w-full h-full flex flex-col'>
      <div className='flex flex-row gap-1 border-gray-900 border-b-4 py-4'>
        <div className='flex-[1.2] px-4 flex flex-row gap-1'>
          <div className='w-full flex flex-col'>
            <div className='pb-4'>
              <div className='text-base/5'>{t('portfolio.total')}</div>
              <div className='text-lg/5.5 font-semibold mt-1'>
                {formatWithCommas(truncate(estimatedBalance, 2), 2)} USD
              </div>
            </div>
            <div className='pt-4 mt-1 flex flex-row justify-between items-center'>
              <div className={assetsClassName}>
                <div className='text-gray-400 text-sm'>{t('portfolio.rwa')}</div>
                <div className='mt-2 text-lg/[23px] font-medium'>
                  {formatWithCommas(truncate(estimatedRwaTotalValue, 2), 2)} USD
                </div>
              </div>
              <div className={assetsClassName}>
                <div className='text-gray-400 text-sm'>{t('portfolio.settle')}</div>
                <div className='mt-2 text-lg/[23px] font-medium'>
                  {formatWithCommas(truncate(estimatedStableTokenTotalValue, 2), 2)} USD
                </div>
              </div>
              {isRiskControlled && (
                <div className={assetsClassName}>
                  <RiskControlAssets
                    riskControlledAssets={riskControlledAssets}
                    chainId={chainId}
                    account={account}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='flex-none border-l border-gray-850'></div>
        <div className='flex-1 px-4 h-full relative'>
          <AssetsRatio assetsList={assetsList} estimatedBalance={estimatedBalance} />
        </div>
      </div>
      <div className='p-4'>
        <AssetsTable chainId={chainId} account={account} assetsList={assetsList} />
      </div>
    </div>
  )
}

function AssetsRatio({
  assetsList,
  estimatedBalance,
}: {
  assetsList: IAssetItem[]
  estimatedBalance: string
}) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(-1)

  const chartData = useMemo(() => {
    if (!assetsList || assetsList.length === 0) return []

    // 1. 预处理数据：转换 value 为数字并过滤掉 0 值
    const validData = assetsList.filter(item => item.value !== undefined && item.value !== '0')

    // 2. 按价值降序排序
    const sortedData = validData
      .sort((a, b) => advancedSort(a.value, b.value, 'desc'))
      .map(item => ({
        name: item.name!,
        value: parseFloat(item.value || '0'),
        symbol: item.symbol,
        holdings: item.holdings || '0',
      }))

    let top6: ChartData[] = []

    if (sortedData.length > 6) {
      const top5 = sortedData.slice(0, 5)
      const others = sortedData.slice(5)
      const othersValue = others.reduce((acc, cur) => sum(acc, cur.value), '0')
      const othersHoldings = others.reduce((acc, cur) => sum(acc, cur.holdings), '0')
      const othersItem: ChartData = {
        name: t('portfolio.others'),
        value: parseFloat(othersValue),
        symbol: t('portfolio.others'),
        holdings: othersHoldings,
      }
      top6 = [...top5, othersItem]
    } else {
      top6 = sortedData.slice(0, 6)
    }

    return top6.map(item => {
      const ratio = divide(item.value, estimatedBalance)
      const isTooSmall = isLess(ratio, '0.01')
      return {
        ...item,
        ratio: multiply(toFixed(divide(item.value, estimatedBalance), 4), 100),
        isTooSmall,
      }
    })
  }, [assetsList, estimatedBalance])

  const chartDataToList = Array.from({ length: Math.ceil(chartData.length / 3) }, (_, idx) =>
    chartData.slice(idx * 3, idx * 3 + 3)
  )

  return (
    <>
      <div className='text-sm/4.5 absolute top-0 left-4'>{t('portfolio.ratio')}</div>
      <div className='flex flex-row h-full'>
        <div className='flex-none min-w-[40%] flex flex-col mt-10 justify-start h-full'>
          <div className='flex flex-row'>
            {chartDataToList.map((list, listIdx) => {
              return (
                <div key={list[0].name} className={cn('', listIdx === 0 ? '' : 'ml-4')}>
                  {list.map((item, idx) => {
                    const index = listIdx * 3 + idx
                    const color = COLORS[index % COLORS.length]
                    const isActive = activeIndex === index
                    return (
                      <div
                        key={item.name}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(-1)}
                        className={cn(
                          'flex flex-row cursor-pointer items-center rounded-[4px] px-2 py-1 transition-all duration-300 relative',
                          idx === 0 ? '' : 'mt-3',
                          isActive ? ' bg-opacity-08 rounded-[4px]' : ''
                        )}
                      >
                        <div
                          className={`absolute left-0 mr-1 rounded-tl-[4px] rounded-bl-[4px] top-0 bottom-0 w-[3px] transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                          style={{ backgroundColor: color }}
                        />
                        <div
                          style={{
                            backgroundColor: color,
                            borderColor: color,
                          }}
                          className={cn(
                            'w-1.5 h-1.5 border rounded-[50%] mr-2',
                            isActive ? 'scale-110 shadow-[0_0_8px_rgba(0,0,0,0.5)]' : ''
                          )}
                        ></div>
                        <span
                          className={cn(
                            'text-xs/[15px] text-gray-400',
                            isActive ? 'text-white' : ''
                          )}
                        >
                          {item.symbol}{' '}
                          {textPrefix(formatLargeNumber(truncate(item.value, 2)), '$')} (
                          {!item.isTooSmall ? item.ratio : '<1'}%)
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
        <div className='flex-1'>
          <div
            className='w-full h-[132px]'
            style={{
              backgroundImage: 'url(/images/v2/portfolio/pie-bg.svg)',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `left 33px top 30px`,
            }}
          >
            <AssetsPieChart
              chartData={chartData}
              activeIndex={activeIndex}
              onActiveIndexChange={setActiveIndex}
            />
          </div>
        </div>
      </div>
      {/* <div className='w-[40%] absolute right-0 top-0'>
        <div
          className='w-full h-[132px]'
          style={{
            backgroundImage: 'url(/images/v2/portfolio/pie-bg.svg)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left 43px top 30px',
          }}
        >
          <AssetsPieChart
            chartData={chartData}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
          />
        </div>
      </div> */}
    </>
  )
}

const RiskControlAssets = memo(
  ({
    riskControlledAssets,
  }: {
    chainId: number
    account: string
    riskControlledAssets: IRiskControlAsset[]
  }) => {
    const { t } = useTranslation()
    const rwaList = useRwaTokens(false)
    const tokenList = useTokens()

    const [open, setOpen] = useState(false)

    return (
      <>
        <div className='text-gray-400 text-sm'>
          {t('portfolio.risk')}
          {riskControlledAssets.length > 0 && (
            <span
              onClick={() => setOpen(true)}
              className='cursor-pointer ml-2 text-xs text-[#2962FF]'
            >
              {t('portfolio.details')}
            </span>
          )}
        </div>
        <div className='mt-2 text-lg/[23px] font-medium relative h-[23px] py-[2px]'>
          {riskControlledAssets.length > 0
            ? riskControlledAssets.slice(0, 7).map((item, idx) => {
                const rwa = [...rwaList, ...tokenList].find(rwa => rwa.address === item.token)
                if (!rwa) return null
                const left = idx * 18 - idx * 5
                return (
                  <LazyImage
                    key={rwa.symbol}
                    style={{
                      left: `${left}px`,
                    }}
                    className={cn('w-4.5 h-4.5 absolute rounded-[50%]')}
                    src={rwa.icon}
                  />
                )
              })
            : '--'}
          {riskControlledAssets.length > 7 && (
            <LazyImage
              src='/images/v2/portfolio/more.svg'
              className='absolute w-[11px] h-[15px] left-[96px] mt-[5px] ml-[3px]'
            />
          )}
        </div>
        <DialogController
          topFixed
          open={open}
          headerClassName={'border-b pt-4 pb-3 px-6 border-b-gray-850'}
          closeClassName={'w-4 h-4 cursor-pointer opacity-100'}
          closeIconClassName={'w-4 h-4'}
          titleClassName={'text-base/5'}
          openChange={setOpen}
          title={t('portfolio.lockDetail')}
          overlayClassName='bg-gray-900/60'
          className='w-[420px] top-[10vh] [@media(min-height:900px)]:top-[197px] bg-gray-950 border border-gray-850 rounded-2xl p-0 gap-0'
        >
          <div className='px-6 pt-4 pb-6 gap-4 flex flex-col font-normal'>
            <div className='bg-gray-900 p-3 rounded-[4px]'>
              <div className='text-yellow-50 text-sm/4.5'>{t('portfolio.riskTitle')}</div>
              <div className='text-yellow-50 text-sm/4.5 mt-4.5'>
                <Trans
                  i18nKey='portfolio.email'
                  values={{ email: 'contact@tiko.cc' }}
                  components={[<span className='text-blue-50 font-normal' key='email' />]}
                />
              </div>
            </div>
            <div className='bg-gray-900 p-3 rounded-[4px]'>
              <div className='flex flex-row justify-between text-sm/4.5 mb-2 text-gray-400'>
                <span>{t('portfolio.name')}</span>
                <span>{t('portfolio.frozen')}</span>
              </div>
              {riskControlledAssets.map(item => {
                return (
                  <div
                    className='flex flex-row justify-between text-sm/4.5 py-2 [@media(min-height:900px)]:py-4'
                    key={item.token}
                  >
                    <span>{item.symbol}</span>
                    <span>{truncate(item.quantity, 2)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </DialogController>
      </>
    )
  }
)

export default Assets
