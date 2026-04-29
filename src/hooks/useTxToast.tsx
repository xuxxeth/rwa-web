'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTradeStore } from '@/stores/tradeStore'
import { cn } from '@/utils/tw'
import { toast } from 'sonner'
import { useTranslation } from './useTranslation'
import { openScanUrl } from '@/utils/scan'
import CloseX from '@/components/icons/set/CloseX'
import OpenOutline from '@/components/icons/set/OpenOutline'
import StepWallet from '@/components/icons/set/StepWallet'
import StepSign from '@/components/icons/set/StepSign'
import StepChain from '@/components/icons/set/StepChain'
import StepCheckCircle from '@/components/icons/set/StepCheckCircle'

interface CustomToastOptions {
  action: string // place | cancel
  approveed?: boolean
  duration?: number
  onClick?: () => void
}

interface ToastItemProps {
  t: string | number
  action: string // place | cancel
  approveed?: boolean
  onClick?: () => void
}

interface StepDef {
  step: number
  label: string
  labelIng: string
  icon: React.ComponentType<{ size: number; color?: string }>
}

type StepState = 'done' | 'active' | 'pending' | 'error'

const iconColorMap: Record<StepState, string> = {
  active: '#FFB800',
  done: '#2EE4A7',
  error: '#F63C6B',
  pending: '#737A87',
}

function StepIcon({
  state,
  icon: IconComponent,
}: {
  state: StepState
  icon: React.ComponentType<{ size: number; color?: string }>
}) {
  const borderClass: Record<StepState, string> = {
    active: 'step-border-active',
    done: 'border border-green-100',
    error: 'border border-red-100',
    pending: 'border border-gray-500',
  }

  return (
    <div className={cn('flex h-[34px] w-[34px] items-center justify-center rounded-[8px]', borderClass[state])}>
      {state === 'done' ? (
        <StepCheckCircle size={14} color={iconColorMap.done} />
      ) : (
        <IconComponent size={14} color={iconColorMap[state]} />
      )}
    </div>
  )
}

export function TxToastItem({ t, action, approveed, onClick }: ToastItemProps) {
  const { t: $t } = useTranslation()
  const [paused, setPaused] = useState(false)

  const buyStepsList: StepDef[] = [
    { step: 0, label: $t('v2.tx.t1'), labelIng: $t('v2.tx.t2'), icon: StepWallet },
    { step: 1, label: $t('v2.tx.t5'), labelIng: $t('v2.tx.t6'), icon: StepSign },
    { step: 2, label: $t('v2.tx.t71'), labelIng: $t('v2.tx.t71'), icon: StepChain },
  ]
  const sellStepsList: StepDef[] = [
    { step: 1, label: $t('v2.tx.t5'), labelIng: $t('v2.tx.t6'), icon: StepSign },
    { step: 2, label: $t('v2.tx.t71'), labelIng: $t('v2.tx.t71'), icon: StepChain },
  ]

  const stepsList =
    action === 'place' ? (approveed ? buyStepsList.slice(1) : buyStepsList) : sellStepsList

  const txStep = useTradeStore((s) => s.txStep)
  const currentStep = useMemo(
    () => stepsList.find((s) => s.step === txStep),
    [txStep, stepsList],
  )

  const txError = useTradeStore((s) => s.txError)
  const txSuccess = useTradeStore((s) => s.txSuccess)
  const boundToastId = txSuccess.tx ? hx2ToastId[txSuccess.tx] : undefined
  const isCurrentToastBound = boundToastId === t
  const canShowTxResult = !txSuccess.tx || isCurrentToastBound

  const successMsg = useMemo(() => {
    if (txStep > 2 && !txError) return action === 'place' ? $t('v2.tx.t72') : $t('v2.tx.t73')
  }, [txStep, action, txError, $t])

  const descText = canShowTxResult && txSuccess.msg
    ? txSuccess.msg
    : canShowTxResult && txError
      ? txError
      : canShowTxResult && successMsg
        ? successMsg
        : (currentStep?.labelIng ?? '')
  // 如果有txSuccess.msg，说明是后端返回的消息，则3s后自动关闭toast；如果没有，则不自动关闭，等待用户点击关闭
  const durationRef = useRef<number>(0)
  useEffect(() => {
    // @ts-ignore
    let timer: NodeJS.Timeout | undefined
    if(txSuccess.tx && isCurrentToastBound) {
      // timer = setTimeout(() => {
      //   toast.dismiss(t)
      // }, 3000)

      timer = setInterval(() => {
        if (durationRef.current > 30) {
          durationRef.current = 0
          toast.dismiss()
          clearInterval(timer)
        } else {
          if (!paused) {
            durationRef.current++
          }
          
        }
      }, 100)
    }
    return () => timer && clearInterval(timer)
  }, [txSuccess.tx, paused, isCurrentToastBound])


  return (
    <div className='w-[335px] overflow-hidden rounded-[8px] relative'
      onMouseEnter={() => {
        setPaused(true)
      }}
      onMouseLeave={() => {
        setPaused(false)
      }}
    >
      <div className='flex items-center justify-between gap-2 border border-gray-750 bg-gray-800 px-3 py-1.5 rounded-t-[8px]'>
        <span className='text-[12px] font-medium leading-[1.25em] text-white'>
          {$t('v2.tx.txInProgress')}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            toast.dismiss(t)
            onClick?.()
          }}
        >
          <CloseX size={16} color='#FFFFFF' />
        </button>
      </div>

      <div className='relative flex flex-col gap-2 border border-t-0 border-gray-750 bg-gray-850 p-3 rounded-b-[8px]'>
        <div className='flex w-full items-start justify-between gap-2'>
          {stepsList.map((step, index) => {
            const state: StepState =
              txStep > step.step
                ? 'done'
                : txStep === step.step
                  ? txError ? 'error' : 'active'
                  : 'pending'

            return (
              <React.Fragment key={step.step}>
                <div className='flex flex-col items-center gap-2'>
                  <StepIcon state={state} icon={step.icon} />
                  <span
                    className={cn(
                      'text-[12px] font-medium leading-[1.25em]',
                      txStep >= step.step ? 'text-white' : 'text-gray-400',
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < stepsList.length - 1 && (
                  <div className='mt-[16px] h-[1px] flex-1'>
                    <div
                      className={cn(
                        'h-full w-full transition-colors duration-300',
                        txStep > step.step ? 'bg-green-100' : 'bg-gray-500',
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>

        <div className='flex items-center justify-between border-t border-gray-750 pt-2 text-[12px] font-normal'>
          <span className='text-gray-300'>{descText}</span>
          {canShowTxResult && txSuccess.tx && (
            <button
              className='inline-flex items-center gap-1 text-[12px] font-medium text-blue-50'
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                openScanUrl(txSuccess.tx)
              }}
            >
              {$t('v2.tx.t0')}
              <OpenOutline size={14} color='#009DFF' />
            </button>
          )}
        </div>
      </div>
      {canShowTxResult && txSuccess.tx && (
        <div
          className="absolute left-0 bottom-0 right-0 h-[3px] origin-left"
          style={{
            backgroundColor: '#2EE4A7',
            animation: `toast-progress ${3000}ms linear forwards`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      )}
      
    </div>
  )
}

let currentToastId: string | number | undefined
let hx2ToastId: {[key: string]: string | number | undefined} = {}

export function getCurrentToastId() {
  return currentToastId
}

export function setCurrentToastId(id?: string | number) {
  currentToastId = id
}
/**
 * 将hx和toastId绑定起来
 * @returns 
 */

export function setHx2ToastId(hx: string) {
  if (hx) {
    hx2ToastId[hx] = getCurrentToastId()
  }
  
}
/**
 * 根据toastId查找对应的hash，然后些hash对应的toastId清空
 * @returns 
 */

export function updateHx2ToastId(toastId: number | string) {
  const hxItem = Object.entries(hx2ToastId).find(item => item[1] === toastId)
  if (hxItem && hxItem[0]) {
    hx2ToastId[hxItem[0]] = undefined
  }

}


export function useTxToast() {
  function toastFun({ duration, action, approveed, onClick }: CustomToastOptions) {
    toast.custom(
      (t) => {
        // 更新前，先上一个toastId对应的hash清空掉
        const toastId = getCurrentToastId()
        toastId && updateHx2ToastId(toastId)
        setCurrentToastId(t)
        return <TxToastItem t={t} action={action} approveed={approveed} onClick={onClick} />
      },
      { duration: duration || 120000 },
    )
  }

  function toastTxSteps(data: CustomToastOptions) {
    toastFun({ ...data })
  }

  function dismissTxToast() {
    const toastId = getCurrentToastId()
    if (toastId) {
      updateHx2ToastId(toastId)
      toast.dismiss(toastId)
      setCurrentToastId(undefined)
    }
  }

  return { toastTxSteps, dismissTxToast }
}
