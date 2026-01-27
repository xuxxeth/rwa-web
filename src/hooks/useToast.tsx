import { openScanUrl } from '@/utils/scan'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from './useTranslation'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface CustomToastOptions {
  title: string,
  message?: string
  btnText?: string
  duration?: number,
  type?: ToastType,
  tx?: string,
  onClick?: () => void

}
interface ToastItemProps {
  t: string | number
  title: string
  message?: string
  btnText?: string
  duration: number
  color: string
  icon: string,
  tx?: string,
  onClick?: () => void
}

export function ToastItem({
  t,
  title,
  message,
  btnText,
  duration,
  color,
  icon,
  tx,
  onClick,
}: ToastItemProps) {
  const [paused, setPaused] = useState(false)
  const { t: $t } = useTranslation()
  return (
    <div
      className="relative flex items-center justify-between gap-4
                 rounded-[8px] bg-[#282A2F] px-4 py-3 min-h-[54px] pb-[13px] text-white overflow-hidden"
      onMouseEnter={() => {
        setPaused(true)
      }}
      onMouseLeave={() => {
        setPaused(false)
      }}
    >
      {/* 左侧内容 */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <img src={icon} className="w-[18px] h-[18px]" />
        <div className="w-[220px]">
          <div className=" font-normal text-[14px] ">
            {title}
          </div>
          {message && (
            <div className="text-[#9DA3AF] text-[12px] mt-1">
              {message}
            </div>
          )}
        </div>
      </div>

      {/* 右侧按钮 */}
      <div className="flex items-center gap-3 shrink-0">
        {btnText && (
          <button
            className="text-[14px] font-medium px-[14px]"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              toast.dismiss(t)
              onClick?.()
            }}
          >
            {btnText}
          </button>
        )}
        {
          tx && 
            <span className=' inline-flex items-center cursor-pointer text-[14px]'
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                openScanUrl(tx)
              }}
            >{$t('v2.tx.t0')} <img src="/images/v2/icons/link-active.png" className='w-[14px] h-[14px] ml-1' alt="" /> </span>
        }
        <button onClick={() => toast.dismiss(t)}>
          <img src="/images/v2/icons/close.png" className="w-4 h-4" />
        </button>
      </div>

      {/* 底部背景条 */}
      <div className="absolute left-0 bottom-0 right-0 h-[3px] bg-[#41464F]" />

      {/* 进度条 */}
      <div
        className="absolute left-0 bottom-0 right-0 h-[3px] origin-left"
        style={{
          backgroundColor: color,
          animation: `toast-progress ${duration}ms linear forwards`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      />
    </div>
  )
}

export function useToast() {
  function toastFun({ title, message, btnText , duration, type, tx, onClick }: CustomToastOptions) {

    let color = '#009DFF'
    let icon = '/images/v2/icons/info.png'
    if (type === 'success') {
      color = '#2EE4A7'
      icon = '/images/v2/icons/success.png'
    }
    if (type === 'warning') {
      color = '#FFB219'
      icon = '/images/v2/icons/warning.png'
    }
    if (type === 'error') {
      color = '#F63C6B'
      icon = '/images/v2/icons/error.png'
    }
    toast.custom((t) => {
      return (
        <ToastItem
          t={t}
          title={title}
          message={message}
          btnText={btnText}
          duration={duration || 3000}
          color={color}
          icon={icon}
          tx={tx}
          onClick={onClick}
        />
      )
    }, { duration: duration || 3000 })
  }


  function toastSuccess(data: CustomToastOptions) {
    toastFun({...data, type: 'success'})
  }
  function toastError(data: CustomToastOptions) {
    toastFun({...data, type: 'error'})
  }
  function toastWarning(data: CustomToastOptions) {
    toastFun({...data, type: 'warning'})
  }
  function toastInfo(data: CustomToastOptions) {
    toastFun({...data, type: 'info'})
  }
  function toastShow(data: CustomToastOptions) {
    toastFun({...data})
  }

  return { toastSuccess, toastError, toastWarning, toastInfo, toastShow }
}
