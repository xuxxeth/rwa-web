import { useTranslation, Trans } from 'react-i18next'
import { memo, useState } from 'react'
import { formatWithCommas } from '@/utils/format'
import AssetsTable from './AssetsTable'
import { useAssetsList, useRiskControlAssets } from '../assetsList'
import { useRwaTokens, useTokens } from '@/hooks/useTokens'
import { LazyImage } from '@/components/image/LazyImage'
import { cn, toFixed } from '@/utils'
import { DialogController } from '@/components/dialog/DialogController'
import AssetsPieChart from './pieChart'

function Assets({ chainId, account }: { chainId: number; account: string }) {
  const { assetsList, estimatedBalance, estimatedRwaTotalValue, estimatedStableTokenTotalValue } =
    useAssetsList(chainId, account)

  const { t } = useTranslation()
  return (
    <div className='w-full h-full flex flex-col'>
      <div className='flex flex-row gap-1 border-b border-gray-900 border-b-4 py-4'>
        <div className='flex-2 px-4 flex flex-row gap-1'>
          <div className='w-full flex flex-col'>
            <div className='pb-4'>
              <div className='text-base/5'>{t('portfolio.total')}</div>
              <div className='text-lg/5.5 font-semibold mt-1'>
                {formatWithCommas(estimatedBalance, 2)} USD
              </div>
            </div>
            <div className='pt-4 mt-1 flex flex-row items-center'>
              <div className='basis-[240px]'>
                <div className='text-gray-400 text-sm'>{t('portfolio.rwa')}</div>
                <div className='mt-2 text-lg/[23px] font-medium'>
                  {formatWithCommas(estimatedRwaTotalValue, 2)} USD
                </div>
              </div>
              <div className='basis-[240px]'>
                <div className='text-gray-400 text-sm'>{t('portfolio.settle')}</div>
                <div className='mt-2 text-lg/[23px] font-medium'>
                  {formatWithCommas(estimatedStableTokenTotalValue, 2)} USD
                </div>
              </div>
              <div className='basis-[240px]'>
                <RiskControlAssets chainId={chainId} account={account} />
              </div>
            </div>
          </div>
        </div>
        <div className='flex-none border-l border-gray-850'></div>
        <div className='flex-1 px-4 h-full relative'>
          <div className='text-sm/4.5 absolute top-0 left-4'>{t('portfolio.ratio')}</div>
          <div
            className='w-full m-auto mt-[13px] h-[120px]'
            style={{
              backgroundImage: 'url(/images/v2/portfolio/pie-bg.svg)',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          >
            <AssetsPieChart data={assetsList} />
          </div>
        </div>
      </div>
      <div className='p-4'>
        <AssetsTable chainId={chainId} account={account} assetsList={assetsList} />
      </div>
    </div>
  )
}

const RiskControlAssets = memo(({ chainId, account }: { chainId: number; account: string }) => {
  const { t } = useTranslation()
  const rwaList = useRwaTokens(false)
  const tokenList = useTokens()

  const riskControlledAssets = useRiskControlAssets(chainId, account)

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
            详情
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
            <div className='flex flex-row justify-between mb-2 text-sm/4.5 mb-2 text-gray-400'>
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
                  <span>{toFixed(item.quantity, 2)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </DialogController>
    </>
  )
})

export default Assets
