import { LazyImage } from '@/components/image/LazyImage'
import InviteCard from './InviteCard'
import { useSignatureValidStatus } from '@/hooks/useSignature'
import SignButton from '@/components/button/SignButton'
import { AutoBindDialog } from './AutoBindDialog'
import { Suspense, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { IInviteCodeInfo } from '@/service/referral/types'
import { RebateStats } from './RebateStats'

// 授权签名卡片
function AuthorizationCard({ refreshIsSignatureValid }: { refreshIsSignatureValid: () => void }) {
  const { t } = useTranslation()
  return (
    <div className='bg-[#1a1b1e] h-full rounded-[16px] w-[466px] flex flex-col items-center justify-center px-[32px] py-[24px]'>
      <div className='flex flex-col gap-[16px] items-center justify-center w-full'>
        {/* 图标 */}
        <div className='h-[112px] w-[160px] overflow-hidden relative flex items-center justify-center'>
          <LazyImage src='/images/referral/sign.png' className='160px' />
        </div>

        {/* 文字说明 */}
        <p className='font-normal text-[16px] text-white text-center w-[377px] leading-normal'>
          {t('ref.t20')}
        </p>

        <SignButton
          refreshIsSignatureValid={refreshIsSignatureValid}
          className='bg-[#9cff3a] h-[48px] w-[305px] font-semibold text-[16px] '
        />
        {/* 授权按钮 */}
        {/* <button className="bg-[#9cff3a] h-[48px] w-[305px] rounded-[8px] flex items-center justify-center px-[24px] py-[8px] hover:bg-[#8ee62a] transition-colors">
          <p className="font-semibold text-[16px] text-black whitespace-nowrap">
            授权签名
          </p>
        </button> */}
      </div>
    </div>
  )
}

// 主组件
export default function DataStatsSection(props: {
  inviteCodeInfo: IInviteCodeInfo | null
  refreshCodeInfo: () => Promise<any>
  account: string
}) {
  const { inviteCodeInfo, refreshCodeInfo, account } = props
  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()

  return (
    <div className='flex gap-[36px] h-[296px] w-full max-w-full'>
      {/* 左侧卡片 - 待领取返佣 + 数据统计 */}
      <div className='flex-1 overflow-hidden h-full rounded-[16px] border border-[#232427] bg-[#131416]'>
        <RebateStats
          inviteCodeInfo={inviteCodeInfo}
          isSignatureValid={isSignatureValid}
          refreshCodeInfo={refreshCodeInfo}
          account={account}
        />
      </div>
      {/* 右侧卡片 - 授权签名 */}
      <div className='basis-[466px] flex-0'>
        <Suspense fallback={null}>
          {isSignatureValid ? (
            <InviteCard code={inviteCodeInfo?.code} ratio={inviteCodeInfo?.ratio} />
          ) : (
            <AuthorizationCard refreshIsSignatureValid={refreshIsSignatureValid} />
          )}
        </Suspense>
      </div>
    </div>
  )
}
