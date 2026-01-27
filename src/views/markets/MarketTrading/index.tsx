import { BoxCard } from '@/components/BoxCard'
import { useTranslation } from '@/hooks/useTranslation'
import { useState } from 'react'
import { MarketTrading } from '@/components/market-trading'
import { ConvertTabs } from '@/components/markets/ConvertTabs'
import { ConverBody } from '@/components/markets/ConvetBody'
import { FAQ } from '@/components/markets/FAQ'
import { KlineBody } from '../components/Klinebody'
import { useWssOn } from '@/hooks/useWssOn'
import { useBaseStore } from '@/stores/baseStore'
import { useWssStore } from '@/stores/wssStore'
import { DialogController, useShowDialog } from '@/components/dialog/DialogController'
import { OrderList } from '@/components/markets/OrderList'

function Markets() {
  const { t } = useTranslation()
  const [action, setAction] = useState('buy')
  const orderDialog = useShowDialog()

  const setTokenWithPriceByWebSocketData = useBaseStore(
    state => state.setTokenWithPriceByWebSocketData
  )
  const setStockWithPriceByWebSocketData = useBaseStore(
    state => state.setStockWithPriceByWebSocketData
  )
  const stableTokenWithPrice = useWssStore(state => state.setStableTokenWithPrice)
  const updateOriginSummary = useWssStore(state => state.updateOriginSummary)

  useWssOn('summary', (data: any) => {
    setTokenWithPriceByWebSocketData(data || [])
    setStockWithPriceByWebSocketData(data || [])
    stableTokenWithPrice(data || [])
    updateOriginSummary(data || [])
  })

  return (
    <>
      <div className='w-full'>
        <div className=' bg-[#131416] min-h-[100vh] text-white'>
          {/* <div className="flex items-center text-[12px] font-normal my-3">
            <div 
              className=" cursor-pointer"
              onClick={() => {
                router.push('/markets/quotes')
              }}
            >{t('Markets')}</div>
            <LazyImage src="/images/convert/arrow-right.png" className="w-[12px] h-[12px] mx-1" />
            <div>{inputToken?.symbol || '--'}</div>
          </div> */}
          <div className=''>
            <MarketTrading align='left' />
          </div>
          <div className='flex '>
            <div className='flex-1'>
              <KlineBody from='market' />
            </div>
            <div className='w-[340px] shrink-0 flex'>
              <div className='w-[4px] bg-[#1A1B1E] h-full shrink-0'>&nbsp;</div>
              <div className='w-full'>
                <BoxCard className='min-h-[448px] rounded-[4px] p-4 bg-[#131416]'>
                  <ConvertTabs from='markets' onChange={tab => setAction(tab.key)} />
                  <div className='flex items-center justify-between mt-3'>
                    <div className='text-[14px] font-medium rounded-[8px] h-[26px] flex items-center px-2 bg-[#383A40]'>
                      {t('limit')}
                    </div>
                    {/* <div className='flex items-center gap-x-5'>
                      <button
                        disabled={signing}
                        className=' hover:bg-[rgba(255,255,255,0.1)] rounded-[8px] overflow-hidden cursor-pointer'
                        onClick={async e => {
                          e.stopPropagation()
                          e.preventDefault()
                          if (!account) {
                            setShowConnect(true)
                            return
                          }
                          if (signing) return
                          if (!(await validSignature())) {
                            const res = await signature()
                            if (res?.signature) {
                              orderDialog.setOpen(true)
                              refreshIsSignatureValid(true)
                            }
                          } else {
                            orderDialog.setOpen(true)
                          }
                        }}
                      >
                        <IconOrder />
                      </button>
                    </div> */}
                  </div>
                  <ConverBody from='markets' action={action} />
                </BoxCard>
                <FAQ />
              </div>
            </div>
          </div>
        </div>
      </div>
      <DialogController
        className='px-0'
        headerClassName='px-6'
        topFixed
        top={30}
        title={t('assets.tabList.orderHistory')}
        open={orderDialog.open}
        openChange={orderDialog.setOpen}
      >
        <OrderList show={orderDialog.open} />
      </DialogController>
    </>
  )
}

export default Markets
