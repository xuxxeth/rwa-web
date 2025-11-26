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
import wsService, { type OrderEventType } from '@/service/webSocket/service'
import storage from '@/utils/storage'
import { type OrderChanged, checkOrderChangedEqual } from './Shared'

import { useSignatureValidStatus } from '@/hooks/useSignature'

function Assets() {
  const isWalletConnecting = useAppStore(state => state.isWalletConnecting)

  const account = useAccount()
  const chainId = useChainId()

  const { t } = useTranslation()

  const walltedConnected = account && chainId

  const [activeTab, setActiveTab] = useState('assets')

  const { assetsList, estimatedBalance } = useAssetsList(chainId!, account)

  const rwaTokens = useRwaTokens()

  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()

  const [orderChanged, _setOrderChanged] = useState<OrderChanged | null>(null)


  const setOrderChanged = (orderChanged: OrderChanged | null) => {
    _setOrderChanged(prev => {
      if (checkOrderChangedEqual(orderChanged, prev)) {
        return prev
      }
      return orderChanged
    })
  }

  useEffect(() => {
    if (!account || !chainId || !isSignatureValid) return
    const localSignature = storage.getItem(`signature_${account.toLowerCase()}`)
    if (!localSignature) return
    const auth = `Bearer ecdsa-1.${localSignature.account}-${localSignature.nonce}-${localSignature.expires}.${localSignature.signature}`

    const topic: OrderEventType = `order.${chainId}.*`

    const orderListener = (data: any) => {
      const newOrderChanged = {
        orderId: String(data.id),
        status: data.x === 0 ? 'NEW' : data.x,
        eventTime: data.E
      }
      setOrderChanged(newOrderChanged)
    }

    wsService.onAuth(auth, (data) => {
      if (data.code === 9200) {
        // auth 认证成功之后再订阅 order 事件
        wsService.on(topic, orderListener)
      }
    })

    return () => {
      wsService.off(topic, orderListener)
    }

  }, [account, chainId, isSignatureValid])

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
            <WalletNotConnected />
          )}
        </ContentLayout>
      </MainLayout>
      <XFooter />
    </>
  )
}

export default Assets
