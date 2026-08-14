import { LazyImage } from "@/components/image/LazyImage";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/hooks/useRouter";
import { useTranslation } from "@/hooks/useTranslation";
import { AlertTriangle } from "lucide-react";

export function KycTip() {
  const { t } = useTranslation();
  const router = useRouter()
  return (
    <div className="bg-[#131416] rounded-[10px] px-6 py-6 flex flex-col items-center gap-4 w-[420px]">
      <LazyImage src="/images/v2/icons/big-warn.svg" className="w-[64px] h-[64px]" />
      <div>
        <p className="text-[20px] leading-[150%] text-white text-center mb-2">{t("ID Verification")}</p>
        <p className="text-[16px] leading-[150%] text-[#9DA3AF] text-center">{t("events.t34")}</p>
      </div>

      <Button
        variant="primary"
        className="w-full h-11 rounded-[8px] bg-white text-black hover:bg-white"
        onClick={e => {
          e.stopPropagation()
          router.push('/identity')
        }}
      >
        {t("identity.verifyID")}
      </Button>
    </div>
  );
} 