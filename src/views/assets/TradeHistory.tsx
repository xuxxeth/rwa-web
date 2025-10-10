import { useRef, useEffect, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  DropDownFilter,
  TextCell,
  TokenCell,
  SideCell,
  TxHashCell,
} from "./Shared";
import { useQuery } from "@tanstack/react-query";
import { tradeHistoryOptions } from "@/queries";
import {
  noop,
  formatTimestamp,
  toFixed,
  textPrefix,
  textSuffix,
  divide,
} from "@/utils";
import { type ITrade } from "@/service/scan/types";
import { type IRwa } from "@/service/base/types";
import {
  TableHeader,
  TableBody,
  type ITableConfnig,
} from "@/components/table-header";
import {
  useOrderFilterStore,
  generateTradeHistoryFilterObj,
} from "@/stores/orderFilterStore";
import { useSignatureValidStatus } from "@/hooks/useSignature";
import SignatureVerify from "./SignatureVerify";

function TradeHistory(props: {
  chainId: number;
  account: string;
  rwaTokens: IRwa[];
}) {
  const { chainId, account, rwaTokens } = props;
  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus();

  const { t } = useTranslation();

  const { tradeHistoryFilters, updateTradeHistoryFilters } =
    useOrderFilterStore();

  const filters = useMemo(() => {
    const userSelectFilter = generateTradeHistoryFilterObj(tradeHistoryFilters);
    const otherFilter = {
      limit: 30,
    };
    return { ...userSelectFilter, ...otherFilter };
  }, [tradeHistoryFilters]);

  const {
    data,
    isPending,
    status: queryStatus,
    isError,
    error,
  } = useQuery(tradeHistoryOptions(chainId, isSignatureValid, filters));

  console.log("===> trade history data", data);

  // 用于检测滚动到底部的ref
  // const loadMoreRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const observer = new IntersectionObserver((entries) => {
  //     if (
  //       entries[0].isIntersecting &&
  //       hasNextPage &&
  //       !isFetching &&
  //       !isFetchingNextPage
  //     ) {
  //       // 当滚动到加载更多区域且有下一页数据时，触发加载
  //       fetchNextPage();
  //     }
  //   });

  //   if (loadMoreRef.current) {
  //     observer.observe(loadMoreRef.current);
  //   }

  //   return () => {
  //     if (loadMoreRef.current) {
  //       observer.unobserve(loadMoreRef.current);
  //     }
  //   };
  // }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage]);

  // const allTrads = data?.pages.flatMap((page) => page.data) || [];

  return (
    <>
      <div>
        <DropDownFilter
          data={tradeHistoryFilters.side}
          onDataChange={(reduce: (prev: string[]) => string[]) =>
            updateTradeHistoryFilters({
              side: reduce(tradeHistoryFilters.side),
            })
          }
          items={[
            { key: "buy", value: "0" },
            { key: "sell", value: "1" },
          ]}
          title="orderType"
        />
      </div>
      <TableHeader<"", ITrade, { rwaTokens: IRwa[] }>
        lngPrefix="assets.tradeHistory.tableHeader"
        config={tradeHistoryTableConfig}
        sort={null}
        className="border-none bg-white/4 rounded-md text-60"
        onSortChange={noop}
      />
      {isSignatureValid ? (
        <TableBody
          data={data ?? []}
          config={tradeHistoryTableConfig}
          extra={{ rwaTokens }}
          getKey={(item: ITrade) => item.id}
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

const tradeHistoryTableConfig: ITableConfnig<ITrade, { rwaTokens: IRwa[] }> = [
  {
    key: "side",
    sortable: false,
    render: (item: ITrade) => <SideCell side={item.side} />,
    width: 60,
  },
  {
    key: "type",
    sortable: false,
    render: () => null,
    width: 80,
  },
  {
    key: "token",
    sortable: false,
    render: (item: ITrade, { rwaTokens }: { rwaTokens: IRwa[] }) => {
      const rwa = rwaTokens.find((token) => token.stockId === item.stockId);
      return (
        <TokenCell icon={rwa?.icon} token={rwa?.symbol} name={rwa?.name} />
      );
    },
  },
  {
    key: "filledQuantity",
    sortable: false,
    render: (item: ITrade, { rwaTokens }: { rwaTokens: IRwa[] }) => {
      const rwa = rwaTokens.find((token) => token.stockId === item.stockId);
      return (
        <TextCell text={textSuffix(toFixed(item.size, 4), rwa?.symbol || "")} />
      );
    },
  },
  {
    key: "tradeValue",
    sortable: false,
    render: (item: ITrade) => (
      <TextCell text={textPrefix(toFixed(item.amount, 2), "$")} />
    ),
  },
  {
    key: "avgPrice",
    sortable: false,
    render: (item: ITrade) => (
      <TextCell
        text={textPrefix(toFixed(divide(item.amount, item.size), 2), "$")}
      />
    ),
  },
  {
    key: "time",
    sortable: false,
    breakOnSpace: true,
    render: (item: ITrade) => <TextCell text={formatTimestamp(item.txTime)} />,
  },
  {
    key: "txId",
    sortable: false,
    render: (item: ITrade) => <TxHashCell hash={item.txHash} />,
  },
];

export default TradeHistory;
