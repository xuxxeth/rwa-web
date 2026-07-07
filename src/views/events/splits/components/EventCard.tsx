import { Button } from "@/components/ui/button";
import { Badge } from "@/components/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/utils/tw";

export type EventStatus = "active" | "ended" | "suspended" | "pending";

export interface EventData {
  symbol: string;
  company: string;
  isHeld?: boolean;
  eventType: string;
  ratio: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
}


function CornerRibbon({ status }: { status: EventStatus }) {
  const { t } = useTranslation();

  const statusConfig: Record<EventStatus, { label: string; ribbonBg: string; textColor: string }> = {
    active:    { label: t('events.t20'), ribbonBg: "rgba(156,255,58,0.08)", textColor: "#9cff3a" },
    ended:     { label: t('events.t21'), ribbonBg: "#232427",              textColor: "#737a87" },
    suspended: { label: t('events.t22'), ribbonBg: "rgba(255,178,25,0.08)", textColor: "#ffb219" },
    pending:   { label: t('events.t23'), ribbonBg: "rgba(0,157,255,0.08)", textColor: "#009dff" },
  };

  const { label, ribbonBg, textColor } = statusConfig[status];
  return (
    <div className="absolute top-0 right-0 w-[88px] h-[88px] overflow-hidden rounded-tr-[16px] pointer-events-none">
      <div
        className="absolute flex items-center justify-center"
        style={{
          width: 120,
          top: 18,
          right: -28,
          transform: "rotate(45deg)",
          background: ribbonBg,
          padding: "4px 0",
        }}
      >
        <span className="text-[12px] font-medium whitespace-nowrap" style={{ color: textColor }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export function EventCard({ data }: { data: EventData }) {
  const { t } = useTranslation();
  const isActive = data.status === "active";

  return (
    <div className="bg-[#1a1b1e] rounded-[16px] flex flex-col gap-5 p-6 relative overflow-hidden">
      <CornerRibbon status={data.status} />
      {/* Header */}
      <div className="flex gap-2 items-center">
        <img src={'/images/tokens/AAPL.png'} alt={data.symbol} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-white text-[16px] font-semibold leading-none">{data.symbol}</span>
            {data.isHeld && <Badge variant="held">{t("events.t16")}</Badge>}
          </div>
          <span className="text-[#737a87] text-[12px] leading-none font-normal">{data.company}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4">
        {/* Type + Ratio */}
        <div className="flex gap-3 items-start">
          <div className="flex-1 flex flex-col gap-1.5">
            <span className="text-white text-[14px] font-semibold">{data.eventType}</span>
            <span className="text-[#848e9c] text-[12px]">{t("events.t19")}</span>
          </div>
          <div className="flex-1 flex flex-col gap-1.5 items-end">
            <span className="text-white text-[14px] font-semibold">{data.ratio}</span>
            <span className="text-[#848e9c] text-[12px]">{t("events.t10")}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#282a2f]" />

        {/* Times */}
        <div className="flex flex-col gap-2 text-[12px]">
          <div className="flex justify-between items-center">
            <span className="text-[#848e9c]">{t("events.t11")}</span>
            <span className="text-white font-semibold">{data.startTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#848e9c]">{t("events.t12")}</span>
            <span className="text-white font-semibold">{data.endTime}</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <Button 
        className={cn(
          "h-10 rounded-full",
          !isActive && "disabled:bg-[#232427] text-[#4D5562]",
        )}
        disabled={!isActive}
        variant={isActive ? "primary" : "secondary"}
      >
        {isActive ? t("events.t15") : t("events.t14")}
      </Button>
    </div>
  );
}
