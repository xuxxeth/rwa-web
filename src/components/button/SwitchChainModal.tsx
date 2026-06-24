import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LazyImage } from '../image/LazyImage'

interface SwitchChainModalProps {
  open: boolean
  onClose: () => void
}

function ChainItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className='flex h-[64px] items-center gap-4 rounded-[2px] bg-[#111111] px-4'>
      <div className='flex h-[36px] w-[36px] items-center justify-center overflow-hidden rounded-full bg-[#1B1B1B]'>
        <LazyImage src={icon} className='h-[36px] w-[36px] object-cover' />
      </div>
      <span className='text-[18px] font-medium text-white'>{label}</span>
    </div>
  )
}

export default function SwitchChainModal({ open, onClose }: SwitchChainModalProps) {
  if (!open) return null

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4'>
      <div className='relative w-full max-w-[560px] rounded-[12px] bg-white px-6 py-6 text-[#111111] shadow-2xl'>
        <button
          type='button'
          onClick={onClose}
          className='absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#111111]/60 hover:bg-black/5 hover:text-[#111111]'
        >
          <X size={22} />
        </button>

        <div className='flex flex-col items-center text-center'>
          <h2 className='text-[28px] font-bold leading-[1.2]'>切换网络</h2>
          <p className='mt-4 max-w-[420px] text-[15px] font-medium leading-[1.5] text-[#7A7A7A]'>
            平台暂不支持当前钱包选择的网络，请切换至可用网络后继续交易
          </p>
        </div>

        <div className='mt-8 flex flex-col gap-5 px-6'>
          <ChainItem icon='/images/icons/chains/bsc.png' label='BNB Smart Chain' />
          <ChainItem icon='/images/icons/metamask.png' label='Ethereum' />
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
            onClick={onClose}
          >
            断开连接
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
