import { useTranslation } from "@/hooks/useTranslation";
import { useTradeStore } from "@/stores/tradeStore";
import { cn } from "@/utils/tw";
import { TradeType } from "ca-common-web";

export function TradeTypeSwitch() {
  const { t } = useTranslation();
  const tradeType = useTradeStore((state) => state.tradeType);
  const updateTradeType = useTradeStore((state) => state.updateTradeType);

  return (
    <div className="flex items-center gap-x-3">
      <div
        className={cn(
          "text-[14px] font-medium rounded-[4px] h-[26px] flex items-center px-2 cursor-pointer",
          {
            "bg-[#383A40] text-white": tradeType === TradeType.MARKET,
            "bg-[#131416] text-[#9DA3AF]": tradeType === TradeType.LIMIT,
          }
        )}
        onClick={() => {
          updateTradeType(TradeType.MARKET);
        }}
      >
        {t("market")}
      </div>
      <div
        className={cn(
          "text-[14px] font-medium rounded-[4px] h-[26px] flex items-center px-2 cursor-pointer",
          {
            "bg-[#383A40] text-white": tradeType === TradeType.LIMIT,
            "bg-[#131416] text-[#9DA3AF]": tradeType === TradeType.MARKET,
          }
        )}
        onClick={() => {
          updateTradeType(TradeType.LIMIT);
        }}
      >
        {t("limit")}
      </div>
    </div>
  );
}
