import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/utils";
import { type IRwa } from "@/service/base/types";

import HistoryOrderTable from "./HistoryOrderTable";
import OpenOrderTable from "./OpenOrderTable";

function OrderHistory(props: {
  chainId: number;
  account: string;
  rwaTokens: IRwa[];
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"openOrders" | "orderHistory">(
    "openOrders"
  );

  const [openOrderTypes, setOpenOrderTypes] = useState<string[]>(["all"]);

  const [historyOrderTypes, setHistoryOrderTypes] = useState<string[]>(["all"]);

  return (
    <div>
      <div className="inline-flex flex-row border border-white/10 p-0.5 rounded-sm my-5">
        {[{ key: "openOrders" }, { key: "orderHistory" }].map(({ key }) => {
          return (
            <button
              onClick={() => setActiveTab(key as "openOrders" | "orderHistory")}
              className={cn(
                "w-[157px] px-4 py-1.5 font-medium text-base/6 cursor-pointer",
                activeTab === key ? "bg-white/10 rounded-sm" : ""
              )}
            >
              {t(`assets.order.${key}`)}
            </button>
          );
        })}
      </div>
      {activeTab === "openOrders" && (
        <OpenOrderTable
          {...props}
          orderTypes={openOrderTypes}
          setOrderTypes={setOpenOrderTypes}
        />
      )}
      {activeTab === "orderHistory" && (
        <HistoryOrderTable
          {...props}
          rwaTokens={props.rwaTokens}
          orderTypes={historyOrderTypes}
          setOrderTypes={setHistoryOrderTypes}
        />
      )}
    </div>
  );
}

export default OrderHistory;
