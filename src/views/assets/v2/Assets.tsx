import { useTranslation, Trans } from 'react-i18next'
import { memo, useState, useMemo, useEffect } from 'react'
import { formatWithCommas } from '@/utils/format'
import AssetsTable from './AssetsTable'
import { useAssetsList, type IAssetItem } from '../assetsList'
import { useRwaTokens, useTokens } from '@/hooks/useTokens'
import { LazyImage } from '@/components/image/LazyImage'
import { DialogController } from '@/components/dialog/DialogController'
import AssetsPieChart, { type ChartData, COLORS } from './pieChart'
import { OrderTable } from '@/views/assets/v2/shared'
import { type ITableConfig } from '@/components/table-header'
import { TokenCell, TextCell } from '@/views/assets/Shared'
import { useSignatureValidStatus } from '@/hooks/useSignature'
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
  isLess,
  checkAddressEqual,
} from '@/utils'
import { useAppStore } from '@/stores/appStore'
import { CircleLoading } from '@/components/loading'
import { scanApi } from '@/service/scan/api'
import { type IRiskAsset, type IRiskAssetsFilter } from '@/service/scan/types'
import { type IRwa, type IToken } from '@/service/base/types'
import SignatureVerify from '@/components/signature-verify'

const EMPTY_FILTER = {}
const RISK_ASSET_LIMIT = 6

export function AssetsEntry({ chainId, account }: { chainId: number; account: string }) {
  const [, refreshIsSignatureValid, validateSignature] = useSignatureValidStatus()

  if (!validateSignature()) {
    return (
      <SignatureVerify
        desc='signatureVerifyDescTop'
        subDesc={'sigAssetsDescBottom'}
        className='mt-20'
        refreshIsSignatureValid={refreshIsSignatureValid}
        buttonClassName='mt-5'
      />
    )
  }

  return <Assets chainId={chainId} account={account} />
}

function Assets({ chainId, account }: { chainId: number; account: string }) {
  const { t } = useTranslation()
  const { assetsList, estimatedBalance, estimatedRwaTotalValue, estimatedStableTokenTotalValue } =
    useAssetsList(chainId)
  const isSwitchingChain = useAppStore(state => state.isSwitchingChain)

  const [firstPageRiskAssets, setFirstPageRiskAssets] = useState<IRiskAsset[]>([])

  useEffect(() => {
    if (!account || !chainId) {
      return
    }
    fetchFirstPageRiskAssets(RISK_ASSET_LIMIT).then(res => {
      setFirstPageRiskAssets(res)
    })
  }, [account, chainId])

  const isRiskControlled = firstPageRiskAssets.length > 0

  const assetsClassName = isRiskControlled ? '' : 'flex-1'

  if (isSwitchingChain) {
    return <CircleLoading className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
  }

  return (
    <div className='w-full h-full flex flex-col'>
      <div className='flex flex-row gap-1 border-gray-900 border-b-4 py-4'>
        <div className='flex-[1.2] px-4 flex flex-row gap-1'>
          <div className='w-full flex flex-col'>
            <div className='pb-4'>
              <div className='text-base/5'>{t('portfolio.total')}</div>
              <div className='text-lg/5.5 font-semibold mt-1'>
                {estimatedBalance !== undefined
                  ? formatWithCommas(truncate(estimatedBalance, 2), 2)
                  : '--'}{' '}
                USD
              </div>
            </div>
            <div className='pt-4 mt-1 flex flex-row justify-between items-center'>
              <div className={assetsClassName}>
                <div className='text-gray-400 text-sm'>{t('portfolio.rwa')}</div>
                <div className='mt-2 text-lg/[23px] font-medium'>
                  {estimatedRwaTotalValue !== undefined
                    ? formatWithCommas(truncate(estimatedRwaTotalValue, 2), 2)
                    : '--'}{' '}
                  USD
                </div>
              </div>
              <div className={assetsClassName}>
                <div className='text-gray-400 text-sm'>{t('portfolio.settle')}</div>
                <div className='mt-2 text-lg/[23px] font-medium'>
                  {estimatedStableTokenTotalValue !== undefined
                    ? formatWithCommas(truncate(estimatedStableTokenTotalValue, 2), 2)
                    : '--'}{' '}
                  USD
                </div>
              </div>
              {isRiskControlled && (
                <div className={assetsClassName}>
                  <RiskControlAssets
                    riskAssets={firstPageRiskAssets}
                    // riskControlledAssets={riskControlledAssets}
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
          {estimatedBalance !== undefined && (
            <AssetsRatio assetsList={assetsList} estimatedBalance={estimatedBalance} />
          )}
        </div>
      </div>
      <div className='p-4'>
        <AssetsTable chainId={chainId} account={account} assetsList={assetsList} />
      </div>
    </div>
  )
}

export async function fetchFirstPageRiskAssets(limit: number) {
  try {
    const res = await scanApi.getRiskAssets({ limit })
    if (res.code === 9200) {
      return res.data.sort((a, b) => advancedSort(a.amount, b.amount, 'desc')) || []
    }
    return []
  } catch (error) {
    return []
  }
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
    riskAssets,
    chainId,
    account,
  }: {
    chainId: number
    account: string
    riskAssets: IRiskAsset[]
  }) => {
    const { t } = useTranslation()
    const rwaList = useRwaTokens(true)
    const tokenList = useTokens()

    const [open, setOpen] = useState(false)

    return (
      <>
        <div className='text-gray-400 text-sm'>
          {t('portfolio.risk')}
          {riskAssets.length > 0 && (
            <span
              onClick={() => setOpen(true)}
              className='cursor-pointer ml-2 text-xs text-[#2962FF]'
            >
              {t('portfolio.details')}
            </span>
          )}
        </div>
        <div className='mt-2 text-lg/[23px] font-medium relative h-[23px] py-[2px]'>
          {riskAssets.length > 0
            ? riskAssets.map((item, idx) => {
                const rwa = [...rwaList, ...tokenList].find(rwa =>
                  checkAddressEqual(rwa.address, item.token)
                )
                if (!rwa) return null
                const left = idx * 18 - idx * 5
                return (
                  <LazyImage
                    key={item.id}
                    style={{
                      left: `${left}px`,
                    }}
                    className={cn('w-4.5 h-4.5 absolute rounded-[50%]')}
                    src={rwa.icon}
                  />
                )
              })
            : '--'}
          {riskAssets.length > RISK_ASSET_LIMIT && (
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
          <div className='min-h-[300px]'>
            <div className='py-2 px-6 flex flex-row gap-2 font-normal bg-[#FFB2191A]'>
              <LazyImage className='w-3 h-3 mt-[2px]' src='/images/v2/portfolio/warn.svg' />
              <div className='text-white text-xs/4.5'>
                {
                  <Trans
                    i18nKey='portfolio.riskTitle'
                    values={{ email: 'contact@tiko.cc' }}
                    components={[<span className='text-blue-50 font-normal' key='email' />]}
                  />
                }
              </div>
              {/* <div className='text-yellow-50 text-sm/4.5'>{t('portfolio.riskTitle')}</div>
              <div className='text-yellow-50 text-sm/4.5 mt-4.5'>
                <Trans
                  i18nKey='portfolio.email'
                  values={{ email: 'contact@tiko.cc' }}
                  components={[<span className='text-blue-50 font-normal' key='email' />]}
                />
              </div> */}
            </div>

            <div className='mx-6'>
              <OrderTable<IRiskAsset, IRiskAssetsFilter>
                chainId={chainId}
                account={account}
                PAGE_LIMIT={RISK_ASSET_LIMIT}
                dataMode={'pagination'}
                api={scanApi.getRiskAssets}
                scrollId={(item: IRiskAsset) => item.id}
                filter={EMPTY_FILTER}
                tableConfig={riskAssetsTableConfig}
                type={'riskAssets'}
                lngPrefix='portfolio'
                signatureSubTitle='rebate.sigSubTitle'
                scrollToTopWhenPagination={false}
                paginationClassName='justify-center mb-2'
                headerClassName='bg-gray-950 px-0'
                bodyClassName='px-0 border-none'
                paginationSorter={(a, b) => advancedSort(a.amount, b.amount, 'desc')}
              />
            </div>
          </div>
        </DialogController>
      </>
    )
  }
)

const riskAssetsTableConfig: ITableConfig<
  IRiskAsset,
  {
    rwaTokens: IRwa[]
    stableTokens: IToken[]
    refetch: () => void
    onTokenClick?: ((token: IRwa | IToken) => void) | undefined
  }
> = [
  {
    key: 'name',
    sortable: false,
    render: (item: IRiskAsset, { rwaTokens, stableTokens }) => {
      const allTokens = [...stableTokens, ...rwaTokens]
      const token = allTokens.find(token => checkAddressEqual(token.address, item.token))
      if (!token) return '--'
      return (
        <TokenCell
          token={token.symbol}
          name={token.name}
          icon={token.icon}
          iconClassName={cn('w-6 h-6')}
          tokenClassName='font-medium'
        />
      )
    },
  },
  {
    key: 'frozen',
    headerDirection: 'end',
    sortable: false,
    width: 90,
    render: (item: IRiskAsset) => {
      return (
        <div className='w-full text-right'>
          <TextCell
            className='text-sm/4.5 font-medium'
            text={formatWithCommas(truncate(item.amount, 2), 2)}
          />
        </div>
      )
    },
  },
]
