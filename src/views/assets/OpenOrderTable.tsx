import { useMemo, useState } from "react";
import {
  TableHeader,
  TableBody,
  type ITableConfnig,
} from "@/components/table-header";
import { type IRwa } from "@/service/base/types";
import { openOrderOptions } from "@/queries";
import { useQuery } from "@tanstack/react-query";
import { type IOpenOrder } from "@/service/scan/types";
import {
  SideCell,
  TokenCell,
  OrderStatusCell,
  ValueCell,
  TextCell,
  OrderTypeCell,
  DropDownFilter,
} from "./Shared";
import {
  textPrefix,
  toFixed,
  formatTimestamp,
  noop,
  readableDuration,
} from "@/utils";

export default function OpenOrderTable(props: {
  chainId: number;
  account: string;
  rwaTokens: IRwa[];
  orderTypes: string[];
  setOrderTypes: (reduce: (prev: string[]) => string[]) => void;
}) {
  const { chainId, account, rwaTokens, orderTypes, setOrderTypes } = props;

  const filters = useMemo(() => {
    const filters: { side?: string } = {};
    if (
      !orderTypes.includes("all") &&
      orderTypes.length > 0 &&
      orderTypes.length < 2
    ) {
      filters.side = orderTypes.join(",");
    }
    return filters;
  }, [orderTypes]);

  const {
    data,
    isPending,
    status: queryStatus,
    isError,
    error,
  } = useQuery(openOrderOptions(chainId, filters));

  console.log("===> open order data", data);

  return (
    <>
      <div className="flex flex-row gap-4">
        <DropDownFilter
          data={orderTypes}
          onDataChange={setOrderTypes}
          items={[
            { key: "buy", value: "0" },
            { key: "sell", value: "1" },
          ]}
          title={"orderType"}
        />
      </div>
      <TableHeader<"", IOpenOrder, { rwaTokens: IRwa[] }>
        lngPrefix="assets.order.tableHeader"
        config={openOrderTableConfig}
        sort={null}
        className="border-none bg-white/4 rounded-md text-60"
        onSortChange={noop}
      />
      <TableBody<IOpenOrder, { rwaTokens: IRwa[] }>
        data={data ?? []}
        config={openOrderTableConfig}
        extra={{ rwaTokens }}
        getKey={(item: IOpenOrder) => item.id}
      />
    </>
  );
}

const openOrderTableConfig: ITableConfnig<IOpenOrder, { rwaTokens: IRwa[] }> = [
  {
    key: "side",
    sortable: false,
    render: (item: IOpenOrder) => <SideCell side={item.side} />,
    width: 60,
  },
  {
    key: "type",
    sortable: false,
    render: (item: IOpenOrder) => <OrderTypeCell orderType={item.orderType} />,
    width: 80,
  },
  {
    key: "token",
    sortable: false,
    render: (item: IOpenOrder, { rwaTokens }: { rwaTokens: IRwa[] }) => {
      const rwa = rwaTokens.find((token) => token.stockId === item.stockId);
      return (
        <TokenCell icon={rwa?.icon} token={rwa?.symbol} name={rwa?.name} />
      );
    },
  },
  {
    key: "orderPrice",
    sortable: false,
    breakOnSpace: true,
    render: (item: IOpenOrder) => (
      <TextCell text={textPrefix(toFixed(item.price), "$")} />
    ),
  },
  {
    key: "orderAmount",
    sortable: false,
    breakOnSpace: true,
    render: (item: IOpenOrder) => <TextCell text={item.size} />,
  },
  {
    key: "filledAmount",
    sortable: false,
    breakOnSpace: true,
    render: (item: IOpenOrder) => <TextCell text={item.settledSize} />,
  },
  {
    key: "filledValue",
    sortable: false,
    breakOnSpace: true,
    render: (item: IOpenOrder) => <ValueCell amount={item.settledAmount} />,
  },
  {
    key: "orderTime",
    sortable: false,
    render: (item: IOpenOrder) => (
      <TextCell text={formatTimestamp(item.txTime)} />
    ),
  },
  {
    key: "expiration",
    sortable: false,
    render: (item: IOpenOrder) => {
      return <TextCell text={readableDuration(item.validDate)} />;
    },
  },
  {
    key: "status",
    sortable: false,
    render: (item: IOpenOrder) => <OrderStatusCell state={item.state} />,
  },
  {
    key: "action",
    sortable: false,
    render: (item: IOpenOrder) => null,
  },
];
