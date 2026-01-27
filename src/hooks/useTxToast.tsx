'use client'
import { LazyImage } from '@/components/image/LazyImage'
import { useTradeStore } from '@/stores/tradeStore'
import { cn } from '@/utils/tw'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from './useTranslation'
import { openScanUrl } from '@/utils/scan'


interface CustomToastOptions {
  action: string, // place | cancel,
  approveed?: boolean
  duration?: number,
  onClick?: () => void
}
interface ToastItemProps {
  t: string | number
  action: string, // place | cancel,
  approveed?: boolean,
  onClick?: () => void
}


export function ToastItem({
  t,
  action,
  approveed,
  onClick
}: ToastItemProps) {
  const { t: $t } = useTranslation()
  
  const buyStepsList = [
    {step: 0, icon: '/images/v2/icons/wallet.png', label: $t('v2.tx.t1'), labelIng: $t('v2.tx.t2'), },
    {step: 1, icon: '/images/v2/icons/sign.png', label: $t('v2.tx.t5'), labelIng: $t('v2.tx.t6'), },
    {step: 2, icon: '/images/v2/icons/trade.png', label: $t('v2.tx.t71'), labelIng: $t('v2.tx.t71'), },
  ]
  const sellStepsList = [
    {step: 1, icon: '/images/v2/icons/sign.png', label: $t('v2.tx.t5'), labelIng: $t('v2.tx.t6'), },
    {step: 2, icon: '/images/v2/icons/cancel.png', label: $t('v2.tx.t71'), labelIng: $t('v2.tx.t71'), },
  ]

  const stepsList = action === 'place' ? (approveed ? buyStepsList.slice(1) : buyStepsList) : sellStepsList

  const txStep = useTradeStore(state => state.txStep)
  const currentStep = useMemo(() => {
    return stepsList.find(step => step.step === txStep)
  }, [txStep, stepsList])

  const txError = useTradeStore(state => state.txError)
  const txSucess = useTradeStore(state => state.txSuccess)

  const successMsg = useMemo(() => {
    if (txStep > 2 && !txError) return action === 'place' ? $t('v2.tx.t72') : $t('v2.tx.t73')
  }, [txStep, action, txError, txSucess, $t])

  return (
    <div
      className="relative flex items-center justify-between gap-x-11
                 rounded-[8px] bg-[#282A2F] px-5 py-3 text-white overflow-hidden"
        >
      {/* 左侧内容 */}
      <div className=' flex-1 w-[316px]'>
        <div className="w-full flex items-center justify-between">
          {
            stepsList.map((step, index) => {
              return (
                <div key={step.step} className='flex items-center justify-between'>
                  <div className=' relative p-[3px] w-6 h-6 bg-[#232427] rounded-full'
                    
                  >
                    
                    {
                      txStep === step.step && !txError && <LazyImage src='/images/v2/icons/circle.png' className="w-6 h-6 animate-spin absolute left-0 top-0" /> 
                    }
                    
                    <LazyImage src={txStep > step.step ? "/images/v2/icons/success.png" : txError && txStep === step.step ? '/images/v2/icons/tx_error.png' : step.icon} className="w-full h-full " /> 
                  </div>
                  
                  {
                    index < stepsList.length - 1 && 
                    <div className="px-3 flex-1 ">
                      <div className="flex items-center relative">
                        <LazyImage src={stepsList.length > 2 ? '/images/v2/icons/step_trail.png' : '/images/v2/icons/step_trail2.png'} className='w-full' />
                        <div className='h-full w-full absolute left-0 top-0 flex items-center'>
                          <div className={cn(
                            'bg-[#2EE4A7] h-[2px] w-0 transition-all duration-300',
                            txStep > step.step ? 'w-full' : ''
                          )}></div>
                        </div>
                      </div>
                    </div>
                    
                  }
                  
                </div>
              )
            })
          }
          
          
        </div>
        <div className="flex items-center flex-1 w-[316px] justify-between">
        {
          stepsList.map((step, index) => {
            return (
              <div key={step.step} className={cn(
                'text-[#9DA3AF] text-[11px] text-center flex-1 leading-[12px]',
                txStep > step.step ? 'text-[#2EE4A7]' : '',
                index === 0 ? 'text-left ' : index === stepsList.length -1 ? 'text-right ' : '',
                stepsList.length > 2 ? 'max-w-[90px]' : ''
              )}>
                { step.label }
              </div>
            )
          })
        }
        </div>
        <div className='border-t border-[#383A40] pt-[6px] text-[12px] font-normal mt-[8px]'>
          {txSucess.msg ? txSucess.msg : txError ? txError : successMsg ? successMsg : currentStep?.labelIng ?? '' }
          {
            txSucess.tx && 
              <span className=' inline-flex items-center text-[#009DFF] cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  openScanUrl(txSucess.tx)
                }}
              >{$t('v2.tx.t0')} <img src="/images/v2/icons/link-active.png" className='w-[14px] h-[14px] ml-1' alt="" /> </span>
          }
          
        </div>
      </div>
      

      {/* 右侧按钮 */} 
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          toast.dismiss(t)
          onClick?.()
        }}>
          <LazyImage src="/images/v2/icons/close.png" className="w-4 h-4" />
        </button>
      </div>
      
    </div>
  )
}

let currentToastId: string | number | undefined

export function getCurrentToastId() {
  return currentToastId
}

export function setCurrentToastId(id?: string | number) {
  currentToastId = id
}

export function useTxToast() {
  
  function toastFun({ duration, action, approveed, onClick }: CustomToastOptions) {
    
    toast.custom((t) => {
      setCurrentToastId(t)
      return (
        <ToastItem
          t={t}
          action={action}
          approveed={approveed}
          onClick={onClick}
        />
      )
    }, { duration: duration || 120000 })
  }


  function toastTxSteps(data: CustomToastOptions) {
    toastFun({...data })
  }
  function dismissTxToast() {
    if (getCurrentToastId()) {
      toast.dismiss(getCurrentToastId())
      setCurrentToastId(undefined)

    }
  }
  

  return { toastTxSteps, dismissTxToast }
}
