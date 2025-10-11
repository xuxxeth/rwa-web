import { useMemo, useState } from "react";
import {
  TableHeader,
  TableBody,
  type ITableConfnig,
} from "@/components/table-header";
import { type IRwa } from "@/service/base/types";
import { orderHistoryOptions } from "@/queries";
import { useQuery } from "@tanstack/react-query";
import { type IOrder } from "@/service/scan/types";
import { noop } from "@/utils";
import {
  SideCell,
  TokenCell,
  OrderStatusCell,
  TextCell,
  TxHashCell,
  OrderTypeCell,
  DropDownFilter,
} from "./Shared";
import {
  textPrefix,
  textSuffix,
  toFixed,
  formatTimestamp,
} from "@/utils/format";
import { useOrderFilterStore } from "@/stores/orderFilterStore";
import SignatureVerify from "./SignatureVerify";
import { useSignatureValidStatus } from "@/hooks/useSignature";
import { generateOrderHistoryFilterObj } from "@/stores/orderFilterStore";

export default function HistoryOrderTable(props: {
  chainId: number;
  account: string;
  rwaTokens: IRwa[];
}) {
  const { chainId, rwaTokens } = props;

  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus();

  const { orderHistoryFilters, updateOrderHistoryFilters } =
    useOrderFilterStore();

  const filters = useMemo(() => {
    const userSelectFilter = generateOrderHistoryFilterObj(orderHistoryFilters);
    const otherFilter = {
      limit: 30,
    };
    return { ...userSelectFilter, ...otherFilter };
  }, [orderHistoryFilters]);

  const {
    data,
    isPending,
    status: queryStatus,
    isError,
    error,
  } = useQuery(orderHistoryOptions(chainId, isSignatureValid, filters));

  console.log("===> order history", data);

  return (
    <>
      <div className="flex flex-row gap-4">
        <DropDownFilter
          data={orderHistoryFilters.side}
          onDataChange={(reduce: (prev: string[]) => string[]) =>
            updateOrderHistoryFilters({
              side: reduce(orderHistoryFilters.side),
            })
          }
          items={[
            { key: "buy", value: "0" },
            { key: "sell", value: "1" },
          ]}
          title={"orderType"}
        />
        <DropDownFilter
          data={orderHistoryFilters.states}
          onDataChange={(reduce: (prev: string[]) => string[]) =>
            updateOrderHistoryFilters({
              states: reduce(orderHistoryFilters.states),
            })
          }
          title={"orderStatus"}
          items={[
            {
              key: "filled",
              value: "5",
            },
            {
              key: "partiallyFilled",
              value: "1",
            },
            {
              key: "canceled",
              value: "3",
            },
            {
              key: "failed",
              value: "2",
            },
          ]}
        />
      </div>
      <TableHeader<"", IOrder, { rwaTokens: IRwa[] }>
        lngPrefix="assets.order.tableHeader"
        config={orderHistoryTableConfig}
        sort={null}
        className="border-none bg-white/4 rounded-md text-60"
        onSortChange={noop}
      />
      {isSignatureValid ? (
        <TableBody<IOrder, { rwaTokens: IRwa[] }>
          data={data ?? []}
          config={orderHistoryTableConfig}
          extra={{ rwaTokens }}
          getKey={(item: IOrder) => item.orderId}
        />
      ) : (
        <SignatureVerify
          className="mt-9"
          refreshIsSignatureValid={refreshIsSignatureValid}
        />
      )}
    </>
  );
}

const orderHistoryTableConfig: ITableConfnig<IOrder, { rwaTokens: IRwa[] }> = [
  {
    key: "side",
    sortable: false,
    render: (item: IOrder) => <SideCell side={item.side} />,
    width: 60,
  },
  {
    key: "type",
    sortable: false,
    render: (item: IOrder) => <OrderTypeCell orderType={item.orderType} />,
    width: 80,
  },
  {
    key: "token",
    sortable: false,
    render: (item: IOrder, { rwaTokens }: { rwaTokens: IRwa[] }) => {
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
    render: (item: IOrder) => (
      <TextCell text={textPrefix(toFixed(item.price), "$")} />
    ),
  },
  {
    key: "orderAmount",
    sortable: false,
    breakOnSpace: true,
    render: (item: IOrder) => <TextCell text={item.size} />,
  },
  {
    key: "filledAmount",
    sortable: false,
    breakOnSpace: true,
    render: (item: IOrder) => <TextCell text={item.settledSize} />,
  },
  {
    key: "filledValue",
    breakOnSpace: true,
    sortable: false,
    render: (item: IOrder) => (
      <TextCell
        text={
          item.settledAmount === "0"
            ? textSuffix(item.settledAmount, "USDT")
            : textSuffix(toFixed(item.settledAmount, 3), "USDT")
        }
      />
    ),
  },
  {
    key: "executionTime",
    sortable: false,
    breakOnSpace: true,
    render: (item: IOrder) => <TextCell text={formatTimestamp(item.txTime)} />,
  },
  {
    key: "status",
    sortable: false,
    render: (item: IOrder) => <OrderStatusCell state={item.state} />,
  },
  {
    key: "details",
    sortable: false,
    render: () => null,
  },
  {
    key: "txId",
    sortable: false,
    render: (item: IOrder) => <TxHashCell hash={item.txHash} />,
  },
  {
    key: 'orderId',
    sortable: false,
    render: (item: IOrder) => <TextCell text={item.orderId} />,
  }
];
