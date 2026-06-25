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
        'flex h-[64px] w-full items-center gap-4 rounded-[2px] bg-[#111111] px-4 text-left transition-opacity',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-90'
      )}
    >
      <div className='flex h-[36px] w-[36px] items-center justify-center overflow-hidden rounded-full bg-[#1B1B1B]'>
        <LazyImage src={icon} className='h-[36px] w-[36px] object-cover' />
      </div>
      <span className='text-[18px] font-medium text-white'>{label}</span>
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
      chainList.filter(chain => chain.state === 1).slice(0, 2),
    [chainList]
  )

  const chains = useMemo(() => {
    if (supportedChains.length >= 2) return supportedChains

    const fallbackChains = [
      {
        id: 56,
        displayName: 'BNB Smart Chain',
        icon: '/images/icons/chains/bsc.png',
      },
      {
        id: 1,
        displayName: 'Ethereum',
        icon: '/images/icons/metamask.png',
      },
    ]

    const merged = fallbackChains.map(item => {
      const existed = supportedChains.find(chain => chain.id === item.id)
      return existed ?? item
    })

    return merged
  }, [supportedChains])

  const currentActiveChainId = currentChainId ?? chainId ?? null
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
      <div className='relative w-full max-w-[560px] rounded-[12px] bg-white px-6 py-6 text-[#111111] shadow-2xl'>
        <div className='flex flex-col items-center text-center'>
          <h2 className='text-[28px] font-bold leading-[1.2]'>{t('switchNetwork')}</h2>
          <p className='mt-4 max-w-[420px] text-[15px] font-medium leading-[1.5] text-[#7A7A7A]'>
            {t('switchNetworkDesc') || '平台暂不支持当前钱包选择的网络，请切换至可用网络后继续交易'}
          </p>
        </div>

        <div className='mt-8 flex flex-col gap-5 px-6'>
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

        <div className='mt-8 flex items-center gap-4 px-4'>
          <div className='h-px flex-1 bg-[#D9D9D9]' />
          <span className='text-[14px] font-medium text-[#7A7A7A]'>or</span>
          <div className='h-px flex-1 bg-[#D9D9D9]' />
        </div>

        <div className='mt-6 px-4'>
          <Button
            type='button'
            variant='default'
            outline
            className='h-[56px] w-full rounded-[14px] border-[#D6D6D6] bg-white text-[18px] font-semibold text-[#111111] hover:bg-[#F6F6F6]'
            onClick={handleDisconnect}
            loading={disconnecting}
          >
            断开连接
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
