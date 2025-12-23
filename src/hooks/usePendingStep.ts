import { PENDING_STEPS } from "@/service/kyc/types";
import { useKycStore } from "@/stores/kycStore";
import { useMemo } from "react";

export function usePendingStep() {

  const kycStatus = useKycStore(state => state.kycStatus)

  return useMemo(() => {
    const pendingSteps = kycStatus?.pendingSteps || []
    return {
      expired: pendingSteps.includes(PENDING_STEPS.EXPIRED),
      risk3: pendingSteps.includes(PENDING_STEPS.RISK3),
      review: pendingSteps.includes(PENDING_STEPS.REVIEW),
      step: pendingSteps[0]
    }
  }, [kycStatus?.pendingSteps])


}