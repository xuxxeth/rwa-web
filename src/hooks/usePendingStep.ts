import { PENDING_STEPS } from "@/service/kyc/types";
import { useKycStore } from "@/stores/kycStore";
import { useMemo } from "react";

export function usePendingStep() {

  const kycStatus = useKycStore(state => state.kycStatus)

  return useMemo(() => {
    const pendingSteps = kycStatus?.pendingSteps || []
    const step = pendingSteps[0]
    return {
      expired: pendingSteps.includes(PENDING_STEPS.EXPIRED) && step === PENDING_STEPS.EXPIRED,
      risk3: pendingSteps.includes(PENDING_STEPS.RISK3) && step === PENDING_STEPS.RISK3,
      review: pendingSteps.includes(PENDING_STEPS.REVIEW) && step === PENDING_STEPS.REVIEW,
      manualReiview: pendingSteps.includes(PENDING_STEPS.MANUALREVIEW) && step === PENDING_STEPS.MANUALREVIEW,
      step: step
    }
  }, [kycStatus?.pendingSteps])


}