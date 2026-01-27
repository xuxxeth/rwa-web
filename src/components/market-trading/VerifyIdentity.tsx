import { memo, useMemo } from "react";
import { BoxCard } from "../BoxCard";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { useRouter } from "@/hooks/useRouter";
import { RISK_STATUS } from "@/config/constants";
import { useKycExpired, useKycStatus } from "@/hooks/useKycStatus";
import { KYC_OVERALL_STATUS } from "@/service/kyc/types";
import { usePendingStep } from "@/hooks/usePendingStep";

export const useVerifyTip = function() {
  const { t } = useTranslation()
  const { expired, expiring } = useKycExpired()
  const { kycStatus } = useKycStatus()
  const pendingStep = usePendingStep()
  const verifyTip = useMemo(() => {
    let text = t('identity.verifyID')
    if (kycStatus === KYC_OVERALL_STATUS.VERIFIED) {
      text = t('verified')
    }
    // 认证被拒绝
    if (kycStatus === KYC_OVERALL_STATUS.REJECTED) {
      text = t('kyc.t27')
    }
    // 非认证成功的其他状态
    if (kycStatus === KYC_OVERALL_STATUS.NOTVERIFIED || kycStatus === KYC_OVERALL_STATUS.VERIFYING) {
      text = t("identity.verifyID")
    }
    // 认证已过期
    if (kycStatus === KYC_OVERALL_STATUS.EXPIRED || pendingStep.step) {
      text = t('kyc.t51')
    }
    // 风控黑名单
    if (kycStatus === KYC_OVERALL_STATUS.ISSUE) {
      text = t('issue')
    }
    

    return text
  }, [t, kycStatus, expired, expiring, pendingStep.step])

  return {
    verifyTip
  }
}

type MarketTradingProps = {
  align?: string
  riskStatus?: number
}

const VerifyIdentity = memo(
  ({  align = 'center', riskStatus }: MarketTradingProps) => {
    const { t } = useTranslation()
    const router = useRouter()
    
    const { verifyTip } = useVerifyTip()
    
    return (
      <BoxCard className={cn(
        "h-[40px] py-0 flex items-center pl-4 bg-[rgba(243,161,63,0.2)]",
        align === 'left' ? 'justify-start' : 'justify-center'
      )}>
        <div className="flex items-center gap-x-2">
          <div className=" font-normal text-[14px]">{t('identity.verifyTip')}</div>
        </div>
        <button className="cursor-pointer px-4 py-1 text-xs font-semibold rounded-[4px] text-black bg-[rgba(156,255,58,1)] ml-4"
          onClick={() => {
            router.push('/identity')
          }}
          >
            { verifyTip }
        </button>
      </BoxCard>
    )
  }
)

export { VerifyIdentity }