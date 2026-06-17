import { Footer } from '../home/v2/Footer'
import DataStatsSection from './components/DataStatsSection'
import RecordsSection from './components/RecordsSection'
import ReferralHeader from './components/ReferralHeader'
import { useRequest } from '@/hooks/useRequest'
import { referralApi } from '@/service/referral/api'
import type { IInviteCodeInfo } from '@/service/referral/types'
import { RESPONSE_CODE } from '@/config/constants'
import { useSignatureValidStatus } from '@/hooks/useSignature'
import { useAccount } from 'ca-common-web'

export const AccountPage = () => {
  const [isSignatureValid, _, validSignature] = useSignatureValidStatus()
  const account = useAccount()

  const {
    data: inviteCodeInfo,
    loading: inviteCodeInfoLoading,
    error: inviteCodeInfoError,
    run: refreshCodeInfo,
  } = useRequest<IInviteCodeInfo>(
    async () => {
      if (!account || !validSignature()) {
        return null
      }

      const res = await referralApi.getInviteCodeInfo()
      if (res?.code === RESPONSE_CODE.SUCCESS) {
        return res.data
      }
      return null
    },
    [account, isSignatureValid],
    { immediate: Boolean(account) && isSignatureValid, initialData: null }
  )

  return (
    <div className='bg-[#131416] min-h-screen'>
      <div className='max-w-[1200px] mx-auto'>
        <div className='flex flex-col gap-[40px] w-full py-[40px]'>
          {/* 1. 标题区域 */}
          <ReferralHeader />

          {/* 2. 数据统计卡片 */}
          <DataStatsSection
            inviteCodeInfo={inviteCodeInfo}
            account={account}
            refreshCodeInfo={refreshCodeInfo}
          />

          {/* 3. 记录表格 */}
          <RecordsSection />

          {/* 4. Footer */}
          <div className='mt-20'>
            <Footer from="no-account"  />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage
