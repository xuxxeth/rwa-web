import { useCallback, useEffect, useState } from 'react'
import { TabNav, type TabKey } from './TabNav'
import type { IStockActionEvent } from '@/service/event/types'
import { useAppStore } from '@/stores/appStore'
import { DialogController, useShowDialog } from '@/components/dialog/DialogController'
import { useKycStatus } from '@/hooks/useKycStatus'
import { KYC_OVERALL_STATUS } from '@/service/kyc/types'

import { useActiveWeb3 } from '@/hooks/useActiveWe3'
import { RecordHistoryTable } from './HistoryTable'
import { MyRecordTable } from './MyRecordTable'
import { AllRecordTable } from './AllRecordTable'
import { KycTip } from '../../splits/components/KycTip'
import { WithdrawContent } from './WithdrawContent'
import { MultiWithdraw } from './MultiWithdraw'

export default function RecordsSection() {
  
  const kycTipDialog = useShowDialog()
  const withdrawDialog = useShowDialog()

  const { kycStatus } = useKycStatus()

  const [activeTab, setActiveTab] = useState<TabKey>("held");

  const { account } = useActiveWeb3()
  const currentChainId = useAppStore(state => state.currentChainId)


  const handleExchange = useCallback(async (data: IStockActionEvent) => {
    
    // 进行中，且kyc未通过，则弹起kyc认证提示弹窗
    if (account && data?.showStatus === 1 && kycStatus !== KYC_OVERALL_STATUS.VERIFIED) {
      kycTipDialog.show()
      return
    }
  }, [kycStatus, account])

  const handleTabChange = useCallback(async (t: TabKey) => {
    setActiveTab(t);

  }, [])

  useEffect(() => {
    setTimeout(() => {
      withdrawDialog.setOpen(true)
    }, 1000)
  }, [])

  return (
    <div className='min-h-[680px] rounded-[16px] w-full'>
      <div className='flex flex-col gap-[16px] h-full'>
          {/* Tabs */}
        <TabNav active={activeTab} onChange={handleTabChange} />
        <div className=' relative'>
          {activeTab === 'held' && <MyRecordTable chainId={currentChainId} account={account} />}
          {activeTab === 'all' && <AllRecordTable chainId={currentChainId} account={account} />}
          {activeTab === 'history' && <RecordHistoryTable chainId={currentChainId} account={account} />}
        </div>
      </div>

      <DialogController
          className="p-0 "
          headerClassName="px-4 pt-4 border-b border-[#232427] pb-4"
          overlayClassName='z-[49]'
          title={' 1111'}
          open={withdrawDialog.open}
          openChange={withdrawDialog.setOpen}
        >
          <WithdrawContent />
      </DialogController>
      <DialogController
        className="p-0 "
        headerClassName="px-4 pt-4 pb-4"
        overlayClassName='z-[49]'
        title={''}
        open={kycTipDialog.open}
        openChange={kycTipDialog.setOpen}
      >
        <KycTip />
      </DialogController>
    </div>
  )
}