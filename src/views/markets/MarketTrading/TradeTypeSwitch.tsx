import { MARKET_STATUS } from "@/config/constants";
import { useTranslation } from "@/hooks/useTranslation";
import { useBaseStore } from "@/stores/baseStore";
import { useTradeStore } from "@/stores/tradeStore";
import { cn } from "@/utils/tw";
import { SessionType, TradeType } from "ca-common-web";

export function TradeTypeSwitch() {
  const { t } = useTranslation();
  const tradeType = useTradeStore((state) => state.tradeType);
  const updateTradeType = useTradeStore((state) => state.updateTradeType);
  const marketTradeState = useBaseStore(state => state.marketTradeState)
  const updateSessionType = useTradeStore(state => state.updateSessionType)
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
          // 这里要根据当前市场状态来更新下单的SessionType，暂时先写死
          if (marketTradeState === MARKET_STATUS.BEFORE) {
            updateSessionType(SessionType.PRE_MARKET_AND_AFTER_HOURS)
          }
          if (marketTradeState === MARKET_STATUS.OPEN) {
            updateSessionType(SessionType.DEFAULT)
          }
          if (marketTradeState === MARKET_STATUS.AFTER) {
            updateSessionType(SessionType.PRE_MARKET_AND_AFTER_HOURS)
          }
          if (marketTradeState === MARKET_STATUS.OVERNIGHT) {
            updateSessionType(SessionType.OVERNIGHT)
          }
          if (marketTradeState === MARKET_STATUS.CLOSED || marketTradeState === MARKET_STATUS.CLOSE) {
            updateSessionType(SessionType.DEFAULT)
          }
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
