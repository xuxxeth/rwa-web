'use client'
import { LazyImage } from '@/components/image/LazyImage'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type ToastType = 'success' | 'error'

interface CustomToastOptions {
  title: string
  btnText?: string
  onClick?: () => void
  duration?: number,
  type?: ToastType
}

export function useToast() {
  function toastFun({ title, btnText, onClick, duration, type }: CustomToastOptions) {
    toast.custom((t) => {
      return (
        <div
          className={cn(
            "h-[56px] flex items-center justify-between gap-4 rounded-[8px] text-white bg-[#158444] px-[30px] ",
            type === 'error' ? 'bg-[#E21D12]' : 'bg-[#158444]'
          )}
          style={{ width: 'max-content' }}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <LazyImage src={type === 'error' ? '/images/icons/toast/error.png' : '/images/icons/toast/success.png'} className='w-6 h-6' />
            <div className='break-words'>
              <div className=" font-normal text-[16px]">{title}</div>
            </div>
          </div>
          <div className='flex items-center gap-3 shrink-0'>
            {
              btnText && 
              <button className="bg-[rgba(28,55,90,0.16)] text-[16px] font-medium h-[36px] flex items-center px-[14px] shrink-0 rounded-[4px] cursor-pointer"
                onClick={() => {
                  toast.dismiss(t)
                  onClick && onClick()
                }}
              >
                {btnText}
              </button>
            }
            
            <button
              className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
              onClick={() => toast.dismiss(t)}
            >
              <LazyImage src='/images/icons/toast/close.png' className='w-6 h-6' />
            </button>
          </div>
          
        </div>
      )
    }, { duration: duration || 5000 })
  }
  function toastSuccess({ title, btnText, onClick, duration }: CustomToastOptions) {
    toastFun({title, btnText, onClick, duration, type: 'success'})
  }
  function toastError({ title, btnText, onClick, duration }: CustomToastOptions) {
    toastFun({title, btnText, onClick, duration, type: 'error'})
  }
  

  return { toastSuccess, toastError }
}
