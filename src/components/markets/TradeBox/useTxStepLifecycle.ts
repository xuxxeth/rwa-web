import { useCallback, useEffect, useRef } from "react"

type ToastTxSteps = (payload: { action: string; approveed: boolean; onClick: () => void }) => void

interface UseTxStepLifecycleParams {
  txStep: number
  approvalState: number
  setTxStep: (step: number) => void
  setTxError: (message: string) => void
  setTxSuccess: (type: string, msg: string, tx: string) => void
  dismissTxToast: () => void
  toastTxSteps: ToastTxSteps
  refetchAllowance: () => void
}

export function useTxStepLifecycle({
  txStep,
  approvalState,
  setTxStep,
  setTxError,
  setTxSuccess,
  dismissTxToast,
  toastTxSteps,
  refetchAllowance,
}: UseTxStepLifecycleParams) {
  const stepStartRef = useRef(false)

  useEffect(() => {
    if (stepStartRef.current) {
      setTxStep(txStep)
    }
  }, [txStep, setTxStep])

  const handleEndStep = useCallback(() => {
    dismissTxToast()
    setTxError('')
    setTxSuccess('', '', '')
    setTimeout(() => {
      stepStartRef.current = false
      setTxStep(approvalState === 3 ? 1 : 0)
      refetchAllowance()
    }, 500)
  }, [dismissTxToast, setTxError, setTxSuccess, setTxStep, approvalState, refetchAllowance])

  const handleStartStep = useCallback(() => {
    stepStartRef.current = true
    dismissTxToast()
    setTxError('')
    setTxSuccess('', '', '')
    setTxStep(approvalState === 3 ? 1 : 0)
    toastTxSteps({ action: 'place', approveed: approvalState === 3, onClick: handleEndStep })
  }, [dismissTxToast, setTxError, setTxSuccess, setTxStep, approvalState, toastTxSteps, handleEndStep])

  return {
    handleStartStep,
    handleEndStep,
  }
}
