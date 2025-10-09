import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { cn, noop } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import VectorSVG from "@/components/pagination/vector.svg?react";
import { CheckBoxBySVG } from "@/components/check-box";
import TableHeader from "@/components/table-header";

function OrderHistory(props: { chainId: number; account: string }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"openOrders" | "orderHistory">(
    "openOrders"
  );

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
              {t(`assets.orderHistory.${key}`)}
            </button>
          );
        })}
      </div>
      {activeTab === "openOrders" && <OpenOrdersTable {...props} />}
    </div>
  );
}

interface IOpenOrder {
  // 0 sell 1 buy
  side: 0 | 1;
  type: string;
}

function OpenOrdersTable(props: { chainId: number; account: string }) {
  const [orderTypes, setOrderTypes] = useState<string[]>(["all"]);

  const [status, setStatus] = useState<string[]>(["all"]);

  return (
    <>
      <div className="flex flex-row gap-4">
        <DropDownFilter
          data={orderTypes}
          onDataChange={setOrderTypes}
          items={[{ key: "buy" }, { key: "sell" }]}
          title={"orderType"}
        />
        <DropDownFilter
          data={status}
          onDataChange={setStatus}
          title={"status"}
          items={[
            {
              key: "partiallyFilled",
            },
            {
              key: "open",
            },
          ]}
        />
      </div>
      <TableHeader
        lngPrefix="assets.orderHistory.tableHeader"
        config={openOrdersTableConfig}
        sort={null}
        className="border-none bg-white/4 rounded-md text-60"
        onSortChange={noop}
      />
    </>
  );
}

const openOrdersTableConfig = [
  {
    key: "side",
    sortable: false,
    render: () => null,
  },
  {
    key: "type",
    sortable: false,
    render: () => null,
  },
  {
    key: "token",
    sortable: false,
    render: () => null,
  },
  {
    key: "orderPrice",
    sortable: false,
    render: () => null,
  },
  {
    key: "orderAmount",
    sortable: false,
    render: () => null,
  },
  {
    key: "filledAmount",
    sortable: false,
    render: () => null,
  },
  {
    key: "filledValue",
    sortable: false,
    render: () => null,
  },
  {
    key: "orderTime",
    sortable: false,
    render: () => null,
  },
  {
    key: "expiration",
    sortable: false,
    render: () => null,
  },
  {
    key: "status",
    sortable: false,
    render: () => null,
  },
  {
    key: "action",
    sortable: false,
    render: () => null,
  },
];

function DropDownFilter(props: {
  data: string[];
  onDataChange: (reduce: (prev: string[]) => string[]) => void;
  items: { key: string }[];
  title: string;
}) {
  const { t } = useTranslation();
  const { items } = props;
  const [open, setOpen] = useState(false);

  const selectedTypes = props.data;
  const setSelectedTypes = props.onDataChange;

  const handleItemClick = (type: string) => {
    setSelectedTypes((prev: string[]) => {
      if (type === "all") {
        return prev.includes("all") ? ["all"] : ["all"];
      }
      // 如果点击了非"all"选项，先移除"all"
      const withoutAll = prev.filter((item) => item !== "all");
      let res = [];
      if (withoutAll.includes(type)) {
        res = withoutAll.filter((item) => item !== type);
      } else {
        res = [...withoutAll, type];
      }
      return res.length === 0 ? ["all"] : res;
    });
  };

  return (
    <div>
      <div>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            className={cn(
              "cursor-pointer w-[211px] h-10 flex items-center px-4 py-2 border border-white/10 rounded-lg",
              open ? "border-[rgba(156,255,58,0.5)]" : ""
            )}
          >
            {selectedTypes.includes("all") ? (
              <>
                <span className="flex-1 text-left text-sm font-medium">
                  {t(`assets.orderHistory.${props.title}`)}
                </span>
                <span>{t("assets.orderHistory.all")}</span>
              </>
            ) : (
              <span className="flex-1 text-left text-sm font-medium">
                {selectedTypes
                  .map((type) => t(`assets.orderHistory.${type}`))
                  .join(", ")}
              </span>
            )}
            <div
              className={cn(
                "w-4.5 h-4.5 flex items-center justify-center ml-2"
              )}
            >
              <VectorSVG
                className={cn("w-[7px] h-3", open ? "rotate-270" : "rotate-90")}
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-[rgba(19,24,35,1)] border-none w-[211px] py-1 px-0 cursor-pointer [&>div]:focus:bg-[rgba(19,24,35,1)]"
            align="end"
          >
            {[
              {
                key: "all",
                hasSeperator: true,
              },
              ...items,
            ].map(
              ({
                key,
                hasSeperator = false,
              }: {
                key: string;
                hasSeperator?: boolean;
              }) => {
                const checked = selectedTypes.includes(key);
                const mentItem = (
                  <DropdownMenuItem
                    key={key}
                    onClick={(e) => e.preventDefault()}
                    className="px-4 py-3 flex flex-row justify-between"
                  >
                    <CheckBoxBySVG
                      checked={checked}
                      onChange={() => handleItemClick(key)}
                    />
                    <span
                      className={cn(
                        "text-base/6  font-medium",
                        checked ? "text-white" : "text-[rgba(108,134,173,1)]"
                      )}
                    >
                      {t(`assets.orderHistory.${key}`)}
                    </span>
                  </DropdownMenuItem>
                );

                if (hasSeperator) {
                  return (
                    <>
                      {mentItem}
                      <DropdownMenuSeparator className="bg-white/10" />
                    </>
                  );
                } else {
                  return mentItem;
                }
              }
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default OrderHistory;
