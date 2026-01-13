import { useTranslation } from "@/hooks/useTranslation";
import { LazyImage } from "../image/LazyImage";
import { cn } from "@/utils";
import SignButton from "../button/SignButton";
import { useSignatureValidStatus } from "@/hooks/useSignature";
import { useRiskStatus } from "@/hooks/useRiskStatus";
import { RISK_STATUS } from "@/config/constants";
import { useRouter } from "@/hooks/useRouter";
import { useKycRiskLevel, useKycStatus } from "@/hooks/useKycStatus";
import { useVerifyTip } from "../market-trading/VerifyIdentity";
import { KYC_RISK_LEVEL, KYC_STATUS } from "@/service/kyc/types";
import { usePendingStep } from "@/hooks/usePendingStep";

function getVerificationStatusClassName(verified: boolean, issued: boolean) {
  if (!verified) {
    if (issued) {
      return {
        color: "rgba(240,67,73,1)",
        bg: "rgba(240,67,73,0.1)",
        icon: "/images/icons/assets/issue.png",
        text: "issue",
      };
    }
    return {
      color: "rgba(255,204,0,1)",
      bg: "rgba(255,204,0,0.1)",
      icon: "/images/icons/assets/not_verified.png",
      text: "notVerified",
    };
  } else if (!issued) {
    return {
      color: "rgba(0,223,128,1)",
      bg: "rgba(0,223,128,0.1)",
      icon: "/images/icons/assets/verified.png",
      text: "verified",
    };
  } else {
    return {
      color: "rgba(240,67,73,1)",
      bg: "rgba(240,67,73,0.1)",
      icon: "/images/icons/assets/issue.png",
      text: "issue",
    };
  }
}

export function VerificationStatus(props: {
  verified: boolean;
  issued: boolean;
  onClick?: () => void
}) {
  const { t } = useTranslation();
  const { verified, issued } = props;
  const { color, icon, text, bg } = getVerificationStatusClassName(
    verified,
    issued
  );
  const { verifyTip } = useVerifyTip()

  return (
    <div
      className={cn(
        "flex items-center gap-1 justify-center py-1 px-2 rounded-sm text-xs cursor-pointer"
      )}
      style={{
        color,
        background: bg,
      }}
      onClick={() => props.onClick && props.onClick()}
    >
      <LazyImage src={icon} className="w-3.5 h-3.5" />
      <span>{verifyTip || t(text)}</span>
    </div>
  );
}

export function Verification(props: { verified: boolean; issued: boolean }) {
  const router = useRouter()
  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()
  const { riskStatus } = useRiskStatus()
  const { kycStatus } = useKycStatus()
  const pendingStep = usePendingStep()
  const startVerification = () => {
    router.push('/identity')
  }
  return (
    <>
    {
      riskStatus === RISK_STATUS.DEFAULT ? null :
      isSignatureValid && riskStatus !== RISK_STATUS.NOTSIGN ? 
        
        <div className="flex flex-row gap-4">
          {
            (kycStatus === KYC_STATUS.VERIFIED || kycStatus === RISK_STATUS.ISSUE) ?
              <VerificationStatus verified={kycStatus === RISK_STATUS.VERIFIED && !pendingStep.expired} issued={kycStatus === RISK_STATUS.ISSUE} 
              onClick={startVerification}
            /> : null 
          }
          
          {kycStatus !== RISK_STATUS.VERIFIED && kycStatus !== RISK_STATUS.ISSUE && <StartVerificationButton verifying={false} onClick={startVerification} />}
        </div> :
        <SignButton refreshIsSignatureValid={() => {
          refreshIsSignatureValid()
        }} />
    }
    </>
    
  );
}

export function StartVerificationButton({
  verifying,
  onClick
}: {
  verifying?: boolean
  onClick?: () => void
}) {
  const { t } = useTranslation();
  const { verifyTip } = useVerifyTip()
  return (
    <button disabled={verifying} className={cn(
      "cursor-pointer px-4 py-2 text-sm/4 font-semibold rounded-lg text-black bg-[rgba(156,255,58,1)]",
      verifying ? "opacity-60" : ""
    )}
    onClick={() => {
      onClick && onClick()
    }}
    >
      {verifying ? t('identity.verify') + '...' : verifyTip}
    </button>
  );
}
