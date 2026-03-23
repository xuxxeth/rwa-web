import { BoxCard } from '@/components/BoxCard'
import { useTranslation } from '@/hooks/useTranslation'
import { ConvertTabs } from '@/components/markets/ConvertTabs'
import { TradeBox } from '@/components/markets/TradeBox'
import { FAQ } from '@/components/markets/FAQ'
import { KlineBody } from '../components/Klinebody'
import { DialogController, useShowDialog } from '@/components/dialog/DialogController'
import { OrderList } from '@/components/markets/OrderList'
import { PreMarketOpen } from '@/components/markets/PreMarketOpen'
import { TradeTypeSwitch } from './TradeTypeSwitch'

function Markets() {
  const { t } = useTranslation()
  const orderDialog = useShowDialog()
  return (
    <>
      <div className='w-full'>
        <div className=' bg-[#131416] min-h-[100vh] text-white'>
          <div className='w-full bg-[#1A1B1E] h-[4px] shrink-0'>&nbsp;</div>
          <div className='flex'>
            <div className='flex-1'>
              <KlineBody from='market' />
            </div>
            <div className='w-[340px] shrink-0 flex'>
              <div className='w-[4px] bg-[#1A1B1E] h-full shrink-0'>&nbsp;</div>
              <div className='w-full'>
                <PreMarketOpen />
                <div className='w-full bg-[#1A1B1E] h-[4px] shrink-0'>&nbsp;</div>
                <BoxCard className='min-h-[370px] rounded-[4px] p-4 bg-[#131416]'>
                  <ConvertTabs from='markets' />
                  <div className=' mt-3 '>
                    <TradeTypeSwitch />
                  </div>
                  <TradeBox from='markets' />
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
