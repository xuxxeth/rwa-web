'use client'
import React, { useMemo } from 'react'
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

  const successMsg = useMemo(() => {
    if (txStep > 2 && !txError) return action === 'place' ? $t('v2.tx.t72') : $t('v2.tx.t73')
  }, [txStep, action, txError, $t])

  const descText = txSuccess.msg
    ? txSuccess.msg
    : txError
      ? txError
      : successMsg
        ? successMsg
        : (currentStep?.labelIng ?? '')

  return (
    <div className='w-[335px] overflow-hidden rounded-[8px]'>
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
          {txSuccess.tx && (
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
    toast.custom(
      (t) => {
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
    if (getCurrentToastId()) {
      toast.dismiss(getCurrentToastId())
      setCurrentToastId(undefined)
    }
  }

  return { toastTxSteps, dismissTxToast }
}
