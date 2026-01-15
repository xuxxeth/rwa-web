import { useTranslation } from '@/hooks/useTranslation'
import { useAccount, useChains } from 'ca-common-web'
import { shortenAddress } from '@/utils'
import DisconnectButton from '@/components/button/DisconnectButton'
import CopyButton from '@/components/button/copyButton'
import { Verification } from '@/components/verification'
import { formatWithCommas } from '@/utils/format'
import { LazyImage } from '@/components/image/LazyImage'

function AccountDetail(props: { estimatedBalance: string; chainId: number }) {
  const { estimatedBalance, chainId } = props
  const account = useAccount()
  const chains = useChains()
  const { t } = useTranslation()

  const chain = chains.find(item => item.id === chainId)

  return (
    <div className='p-2 rounded-2xl border border-white/10 text-base flex flex-col gap-2'>
      <div className='flex flex-row gap-2 px-2 py-4 bg-[rgba(255,255,255,0.04)] rounded-lg'>
        <div className='flex-1'>
          <div className='text-base/6 text-60 font-normal mb-2'>{t('assets.walletAddress')}</div>
          <div className='flex flex-row gap-2'>
            <span className='text-xl/7.5 font-bold text-white'>{shortenAddress(account)}</span>
            <CopyButton copyText={account} />
            <a
              href={chain?.blockExplorers?.default?.url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex flex-row items-center px-2 gap-1 bg-[rgba(69,122,255,0.2)] rounded-sm cursor-pointer'
            >
              <LazyImage className='w-3.5 h-3.5' src='/images/icons/assets/bsc_scan_logo.png' />
              <span className='text-xs'>{chain?.blockExplorers?.default?.name}</span>
            </a>
          </div>
        </div>
        <div>
          <DisconnectButton />
        </div>
      </div>
      <div className='flex flex-row px-2 py-4 border-b border-white/10'>
        <div className='flex-1 text-base/6 text-60 font-normal mb-2'>
          {t('assets.identityVerification')}
        </div>
        <Verification verified={false} issued={false} />
      </div>
      <div className='flex flex-row px-2 py-4'>
        <div className='flex-1 text-base/6 font-medium text-60'>{t('assets.estimatedBalance')}</div>
        <div className='flex flex-row gap-2 items-end'>
          <span className='font-medium text-[25px] leading-[38px]'>
            {formatWithCommas(estimatedBalance, 2)}
          </span>
          <span className='font-medium text-lg/8 h-8'>USD</span>
        </div>
      </div>
    </div>
  )
}

export default AccountDetail
