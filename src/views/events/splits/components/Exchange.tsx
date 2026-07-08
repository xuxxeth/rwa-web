import CopyButton from "@/components/button/copyButton";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronDown, Copy, AlertTriangle } from "lucide-react";

function AddressLabel({ address }: { address: string }) {
  return (
    <div className="flex items-center gap-0.5">
      <span className="text-[#9da3af] text-[12px] font-mono">{address}</span>
      
      <CopyButton copyText={address} />
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueColor = "text-white",
  underlineLabel = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  underlineLabel?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-0.5 text-[14px]">
      <span
        className={`text-[#9da3af] ${underlineLabel ? "underline decoration-dotted underline-offset-2" : ""}`}
      >
        {label}
      </span>
      <span className={`font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}

export function ExchangeStock() {
  const { t } = useTranslation();

  return (
    <div className="w-[480px] ">
      {/* Body */}
      <div className="bg-[#131416] border-b border-[#232427] px-5 pb-5 flex flex-col gap-4">
        {/* Exchange preview card */}
        <div className="bg-[#1a1b1e] rounded-[10px] px-4 py-5 flex flex-col gap-3">
          {/* From */}
          <div className="flex flex-col gap-3">
            <span className="text-[#9da3af] text-[14px]">{t("events.t29")}</span>
            <div className="flex items-center justify-between h-10">
              <div className="flex items-center gap-2">
                <img src={'/images/tokens/ABNB.png'} alt="AMZNt" className="w-6 h-6 rounded-full object-cover" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-white text-[14px] font-semibold">AMZNt</span>
                  <AddressLabel address="0x5f…4f5e" />
                </div>
              </div>
              <span className="text-white text-[20px] font-semibold">1,000.00</span>
            </div>
          </div>

          {/* Divider arrow */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-[#383a40]" />
            <ChevronDown size={14} className="text-[#737a87]" />
            <div className="flex-1 h-px bg-[#383a40]" />
          </div>

          {/* To */}
          <div className="flex flex-col gap-4">
            <span className="text-[#9da3af] text-[14px]">{t("events.t30")}</span>

            {/* AMZNt row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={'/images/tokens/ABNB.png'} alt="AMZNt" className="w-6 h-6 rounded-full object-cover" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-white text-[14px] font-semibold">AMZNt</span>
                  <AddressLabel address="0x5f…4f5e" />
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[#9cff3a] text-[20px] font-semibold">100.00</span>
                <span className="text-[#9da3af] text-[12px]">{t("events.t25")}</span>
              </div>
            </div>

            {/* USDT row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={'/images/tokens/usdt.png'} alt="USDT" className="w-6 h-6 rounded-full object-cover" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-white text-[14px] font-semibold">USDT</span>
                  <span className="text-[#9da3af] text-[12px]">{t("events.t28")}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[#9cff3a] text-[20px] font-semibold">0.35</span>
                <span className="text-[#9da3af] text-[12px]">{t("events.t27")} {'0.57 AMZNt'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="px-1 flex flex-col gap-2">
          <InfoRow label={t('events.t19')} value="合股" />
          <InfoRow label={t('events.t15') + t('events.t10')} value="10:1" />
          <InfoRow label={t('events.t28')} value="10 USDT/股" valueColor="text-[#9cff3a]" underlineLabel />
          <InfoRow label={t('events.t11')} value="2026/06/12 12:00:00" />
          <InfoRow label={t('events.t12')} value="2026/06/12 12:00:00" />
        </div>

        {/* Warning + disabled button */}
        <div className="flex flex-col gap-3">
          {/* Warning banner */}
          <div className="bg-[rgba(255,178,25,0.1)] rounded-[6px] px-4 py-3 flex items-start gap-2.5">
            <AlertTriangle size={12} className="text-[#ffb219] flex-shrink-0 mt-0.5" />
            <span className="text-[#c7ccd6] text-[12px] leading-normal">
              当前资产兑换暂停，请关注官方公告了解后续开放时间
            </span>
          </div>

          {/* Disabled exchange button */}
          <Button
            variant="primary"
            className="w-full h-11 rounded-[8px] bg-white text-black hover:bg-white"
          >
            {t("events.t15")}
          </Button>
        </div>
      </div>
    </div>
  );
}
