import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from 'react-i18next'
import { useRouter } from '@/hooks/useRouter'
import { useAppStore } from '@/stores/appStore'
import { useAccount, useChainId } from 'ca-common-web'
import WalletNotConnected from '@/components/wallet-not-connected'
import Assets from './Assets'
import Order from './Order'

import AssetsSVG from '@/assets/portfolio/assets.svg?react'
import OrderSVG from '@/assets/portfolio/order.svg?react'
import { useEffect, useRef } from 'react'

function Portfolio() {
  const isWalletConnecting = useAppStore(state => state.isWalletConnecting)

  const account = useAccount()
  const chainId = useChainId()

  const walltedConnected = account && chainId

  const initialConnectingFinished = useRef(false)

  useEffect(() => {
    if (!isWalletConnecting) {
      initialConnectingFinished.current = true
    }
  }, [isWalletConnecting])

  if (!walltedConnected && isWalletConnecting && !initialConnectingFinished.current) {
    return null
  }

  if (!walltedConnected) {
    return <WalletNotConnected desc='portfolio.walletNotConnected' />
  }

  return <MainContent chainId={chainId} account={account} />
}

function MainContent({ chainId, account }: { chainId: number; account: string }) {
  const { t } = useTranslation()
  const router = useRouter()

  const activeTab = router.location.pathname.includes('/order') ? 'order' : 'assets'

  return (
    <div className='flex flex-row border-gray-900 border-y-4 text-white min-h-[calc(100vh-64px)] font-normal'>
      <div className='flex-none px-4 pt-4 border-gray-900 border-r-4 w-[224px]'>
        <div className='flex flex-row items-center px-3 py-2.5 gap-2.5 bg-gray-900 rounded-sm border border-gray-850 text-gray-500'>
          <LazyImage className='w-4 h-4' src='/images/v2/portfolio/my.svg' />
          <div className='text-base/5'>{t('portfolio.my')}</div>
        </div>
        <div className='px-2 mt-2'>
          {[
            {
              Icon: AssetsSVG,
              text: 'assets',
              active: activeTab === 'assets',
              value: 'assets' as 'assets',
            },
            {
              Icon: OrderSVG,
              text: 'order',
              active: activeTab === 'order',
              value: 'order' as 'order',
            },
          ].map(({ Icon, text, active, value }) => {
            return (
              <div
                onClick={() => router.push(value === 'order' ? '/order' : '/portfolio')}
                className={`flex flex-row items-center px-3 py-2.5 gap-2 cursor-pointer border-l border-gray-850 text-gray-400 ${
                  active ? 'border-white text-white' : ''
                }`}
                key={text}
              >
                <Icon />
                <div className='text-base/5'>{t(`portfolio.${text}`)}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div className='flex-1 flex flex-col'>
        {activeTab === 'assets' && <Assets chainId={chainId} account={account} />}
        {activeTab === 'order' && (
          <div className='h-full py-4'>
            <Order
              allowUserFilter={true}
              chainId={chainId}
              account={account}
              showFilter={true}
              dataMode='pagination'
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Portfolio
