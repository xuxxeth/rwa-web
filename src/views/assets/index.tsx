import { useState, useEffect } from 'react'
import { XFooter } from '@/components/footer'
import { MainLayout } from '@/layouts/main'
import ContentLayout from '@/layouts/content'
import { useAccount, useChainId } from 'ca-common-web'
import WalletNotConnected from '@/components/wallet-not-connected'
import AccountDetail from './Account'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useTranslation } from '@/hooks/useTranslation'
import AssetsTable from './assetsTable'
import { useAssetsList } from './assetsList'
import OrderHistory from './OrderHistory'
import TradeHistory from './TradeHistory'
import { useRwaTokens } from '@/hooks/useTokens'
import { useAppStore } from '@/stores/appStore'
import { type OrderChanged, checkOrderChangedEqual } from './Shared'
import { useWssStore } from "@/stores/wssStore";

function Assets() {
  const isWalletConnecting = useAppStore(state => state.isWalletConnecting)

  const account = useAccount()
  const chainId = useChainId()

  const { t } = useTranslation()

  const walltedConnected = account && chainId

  const [activeTab, setActiveTab] = useState('assets')

  const { assetsList, estimatedBalance } = useAssetsList(chainId!, account)

  const rwaTokens = useRwaTokens()

  const [orderChanged, _setOrderChanged] = useState<OrderChanged | null>(null)

  const newOrder = useWssStore(state => state.newOrder)

  const setOrderChanged = (orderChanged: OrderChanged | null) => {
    _setOrderChanged(prev => {
      if (checkOrderChangedEqual(orderChanged, prev)) {
        return prev
      }
      return orderChanged
    })
  }

  useEffect(() => {
    if (newOrder === null) return
    const newOrderChanged = {
      orderId: String(newOrder.id),
      status: newOrder.x,
      eventTime: newOrder.E
    }
    setOrderChanged(newOrderChanged)
  }, [newOrder])

  return (
    <>
      <MainLayout>
        <ContentLayout>
          {walltedConnected ? (
            <div className='px-[95px] pt-10'>
              <AccountDetail estimatedBalance={estimatedBalance} chainId={chainId} />
              <Tabs defaultValue={activeTab} className='mt-8'>
                <TabsList className='bg-transparent px-0 pl-2 gap-6'>
                  {[{ key: 'assets' }, { key: 'orderHistory' }, { key: 'tradeHistory' }].map(
                    ({ key }) => (
                      <TabsTrigger
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className='text-xl/7 cursor-pointer px-0 py-2 font-medium!'
                        value={key}
                      >
                        {t(`assets.tabList.${key}`)}
                      </TabsTrigger>
                    )
                  )}
                </TabsList>
                <TabsContent value={activeTab} className='mt-4'>
                  {activeTab === 'assets' && (
                    <AssetsTable assetsList={assetsList} chainId={chainId} account={account} />
                  )}
                  {activeTab === 'orderHistory' && (
                    <OrderHistory chainId={chainId} account={account} rwaTokens={rwaTokens} orderChanged={orderChanged} />
                  )}
                  {activeTab === 'tradeHistory' && (
                    <TradeHistory chainId={chainId} account={account} rwaTokens={rwaTokens} orderChanged={orderChanged} />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : isWalletConnecting ? null : (
            <WalletNotConnected desc='assets.walletNotConnected' />
          )}
        </ContentLayout>
      </MainLayout>
      <XFooter />
    </>
  )
}

export default Assets
