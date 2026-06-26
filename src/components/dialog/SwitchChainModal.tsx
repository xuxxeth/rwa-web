import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { LazyImage } from '../image/LazyImage'
import { useBaseStore } from '@/stores/baseStore'
import { useAppStore } from '@/stores/appStore'
import { useActiveWeb3 } from '@/hooks/useActiveWe3'
import { useToast } from '@/hooks/useToast'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'

interface SwitchChainModalProps {
  open: boolean
  onClose: () => void
}

function ChainItem({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: string
  label: string
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-[64px] w-full items-center justify-between gap-3 bg-[#232427] px-4 text-left transition-opacity rounded-[8px] group',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-90'
      )}
    >
      <div className='flex items-center space-x-3'>
        <div className='flex h-[36px] w-[36px] items-center justify-center overflow-hidden rounded-full bg-[#1B1B1B]'>
          <LazyImage src={icon} className='h-[36px] w-[36px] object-cover' />
        </div>
        <span className='text-[16px] font-medium text-white'>{label}</span>
      </div>
      <div className='hidden group-hover:block'>
        <LazyImage src='/images/referral/chain_selected.png' className='w-6 h-6 ' />
      </div>
    </button>
  )
}

export default function SwitchChainModal({ open, onClose }: SwitchChainModalProps) {
  const { t } = useTranslation()
  const { toastError } = useToast()
  const { handleSwitchChain, handleDisConnect, chainId } = useActiveWeb3()
  const chainList = useBaseStore(s => s.chainList)
  const currentChainId = useAppStore(s => s.currentChainId)
  const [loadingChainId, setLoadingChainId] = useState<number | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)


  const supportedChains = useMemo(
    () =>
      chainList.filter(chain => chain.state === 1),
    [chainList]
  )


  const chains = useMemo(() => {
    return supportedChains
  }, [supportedChains])

  const networkText = useMemo(() => chains.map(chain => chain.displayName).join(' / '), [chains])

  if (!open) return null

  const handleSwitch = async (targetChainId: number) => {
    if (loadingChainId) return

    try {
      setLoadingChainId(targetChainId)
      const ok = await handleSwitchChain(targetChainId)
      if (ok) {
        onClose()
      } else {
        toastError({ title: t('switchNetwork', { network: networkText }) })
      }
    } catch (error) {
      toastError({ title: t('switchNetwork', { network: networkText }) })
    } finally {
      setLoadingChainId(null)
    }
  }

  const handleDisconnect = async () => {
    if (disconnecting) return
    try {
      setDisconnecting(true)
      await handleDisConnect()
      onClose()
    } catch (error) {
      toastError({ title: t('walletDisconnect') })
    } finally {
      setDisconnecting(false)
    }
  }

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4'>
      <div className='relative w-[418px] rounded-[16px] bg-[#131416] text-white shadow-2xl'>
        <div className='flex items-center px-6 pt-6 pb-4 border-b border-[#232427]'>
          <h2 className='text-[16px] font-semibold '>{'切换网络'}</h2>
        </div>
        <div className='p-6'>
          <div className=' font-normal text-[#C7CCD6] text-[14px] mb-4'>{'平台暂不支持当前钱包选择的网络，请切换至可用网络后继续交易'}</div>
          <div className='flex flex-col gap-5'>
            {chains.map(chain => (
              <ChainItem
                key={chain.id}
                icon={chain.icon}
                label={chain.displayName}
                disabled={loadingChainId === chain.id}
                onClick={() => handleSwitch(chain.id)}
              />
            ))}
          </div>
          <div className='mt-3 flex items-center gap-4'>
            <div className='h-px flex-1 bg-[#232427]' />
            <span className='text-[14px] font-medium text-[#737A87]'>or</span>
            <div className='h-px flex-1 bg-[#232427]' />
          </div>

          <div className='mt-3'>
            <Button
              type='button'
              variant='default'
              outline
              className='h-[64px] w-full rounded-[8px] bg-[#232427] border-[#232427] text-[16px] font-medium text-white hover:bg-[#232427]'
              onClick={handleDisconnect}
              loading={disconnecting}
            >
              {t('Disconnect')}
            </Button>
          </div>
        </div>
        

        
      </div>
    </div>,
    document.body
  )
}
