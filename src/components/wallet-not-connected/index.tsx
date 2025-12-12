import { LazyImage } from '@/components/image/LazyImage'
import { useTranslation } from '@/hooks/useTranslation'
import { ConnectButtonText } from '../button/ConnectButtonText'

function WalletNotConnected({ desc }: { desc: string }) {
  const { t } = useTranslation()
  return (
    <div className='flex items-center flex-row justify-center mt-[77px]'>
      <div className='w-[323px] text-center'>
        <LazyImage className='w-22 h-22 m-auto' src='/images/icons/assets/wallet_empty.png' />
        <div className='my-4 text-2xl/9 font-semibold text-white'>
          {t('assets.walletNotConnected')}
        </div>
        <div className='text-60 text-base/6 font-normal mb-8'>{t(desc)}</div>
        <ConnectButtonText className='bg-white rounded-2xl text-black mx-1 justify-center text-base/6 w-full py-2 h-14' />
      </div>
    </div>
  )
}

export default WalletNotConnected
