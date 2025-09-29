import { useTranslation } from "react-i18next";
import { LazyImage } from "@/components/image/LazyImage";

function TradingHaltBtn() {
  const { t } = useTranslation();
  return (
    <button className="flex flex-row gap-2 items-center justify-center py-2 px-3 bg-[rgba(238,68,63,0.1)] rounded-[5px]">
      <LazyImage
        className="w-4 h-4"
        src="/images/convert/lock.png"
        alt={t("marketQuotes.tradingHalt")}
      />
      <span className="text-xs/3.5 font-medium">
        {t("marketQuotes.tradingHalt")}
      </span>
    </button>
  );
}

export default TradingHaltBtn;
