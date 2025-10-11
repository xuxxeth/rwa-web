import {
  TableHeader,
  TableBody,
  type ITableConfnig,
} from "@/components/table-header";
import { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { type IRwa } from "@/service/base/types";
import { openOrderOptions, infiniteOpenOrderOptions } from "@/queries";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
  cn,
  textPrefix,
  toFixed,
  formatTimestamp,
  noop,
  readableDuration,
} from "@/utils";
import { useTradeUtils } from "@/hooks/useCaCommon";
import { useToast } from "@/hooks/useToast";
import {
  useOrderFilterStore,
  generateOpenOrderFilterObj,
} from "@/stores/orderFilterStore";
import { useSignatureValidStatus } from "@/hooks/useSignature";
import SignatureVerify from "./SignatureVerify";

export default function OpenOrderTable(props: {
  chainId: number;
  account: string;
  rwaTokens: IRwa[];
}) {
  const { chainId, account, rwaTokens } = props;

  const { openOrderFilters, updateOpenOrderFilters } = useOrderFilterStore();

  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus();

  const filter = useMemo(() => {
    const userSelectFilter = generateOpenOrderFilterObj(openOrderFilters);
    const otherFilter: Record<string, string | number> = {
      limit: 10,
    };
    return { ...userSelectFilter, ...otherFilter };
  }, [openOrderFilters]);

  // const {
  //   data,
  //   isPending,
  //   status: queryStatus,
  //   isError,
  //   error,
  //   refetch,
  // } = useQuery(openOrderOptions(chainId, isSignatureValid, filter));
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isLoading,
    isError,
  } = useInfiniteQuery(
    infiniteOpenOrderOptions(chainId, isSignatureValid, filter)
  );

  const allOpenOrders = data?.pages?.flatMap((page) => page.data) || [];

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        hasNextPage &&
        !isFetching &&
        !isFetchingNextPage
      ) {
        // 当滚动到加载更多区域且有下一页数据时，触发加载
        fetchNextPage();
      }
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <div className="flex flex-row gap-4">
        <DropDownFilter
          data={openOrderFilters.side}
          onDataChange={(reduce: (prev: string[]) => string[]) =>
            updateOpenOrderFilters({
              side: reduce(openOrderFilters.side),
            })
          }
          items={[
            { key: "buy", value: "0" },
            { key: "sell", value: "1" },
          ]}
          title={"orderType"}
        />
        {/* <DropDownFilter
          data={openOrderFilters.states}
          onDataChange={(reduce: (prev: string[]) => string[]) =>
            updateOpenOrderFilters({
              states: reduce(openOrderFilters.states),
            })
          }
          items={[
            { key: "open", value: "0" },
            { key: "partiallyFilled", value: "1" },
          ]}
          title={"orderStatus"}
        /> */}
      </div>
      <TableHeader<"", IOpenOrder, { rwaTokens: IRwa[] }>
        lngPrefix="assets.order.tableHeader"
        config={openOrderTableConfig}
        sort={null}
        className="border-none bg-white/4 rounded-md text-60"
        onSortChange={noop}
      />
      {isSignatureValid ? (
        <>
          <TableBody<IOpenOrder, { rwaTokens: IRwa[] }>
            data={allOpenOrders}
            config={openOrderTableConfig}
            extra={{ rwaTokens }}
            getKey={(item: IOpenOrder) => item.id}
          />
          <div ref={loadMoreRef} className="py-4 text-center">
            {isFetchingNextPage ? (
              <div className="text-gray-500">加载中...</div>
            ) : hasNextPage ? (
              <div className="text-gray-400">滚动加载更多</div>
            ) : allOpenOrders.length > 0 ? (
              <div className="text-gray-400">没有更多数据了</div>
            ) : null}
          </div>
          {isLoading && allOpenOrders.length === 0 && (
            <div className="py-8 text-center text-gray-500">加载中...</div>
          )}
          {!isLoading && allOpenOrders.length === 0 && (
            <div className="py-8 text-center text-gray-400">暂无数据</div>
          )}
        </>
      ) : (
        <SignatureVerify
          className="mt-9"
          refreshIsSignatureValid={refreshIsSignatureValid}
        />
      )}
    </>
  );
}

const Day = 1 * 60 * 60 * 24;

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
      return <TextCell text={readableDuration(item.validDate * Day)} />;
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
    render: (item: IOpenOrder) => <CancelOrderButton orderId={item.orderId} />,
  },
  {
    key: "orderId",
    sortable: false,
    render: (item: IOpenOrder) => <TextCell text={item.orderId} />,
  },
];

function CancelOrderButton(props: { orderId: string }) {
  const { t } = useTranslation();
  const { orderId } = props;
  const { cancelOrder } = useTradeUtils();
  const { toastSuccess } = useToast();
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelOrder = async () => {
    try {
      setIsCanceling(true);
      // TODO: 需要在 ca-common-web 里修复
      await cancelOrder(orderId as unknown as number, { wait: true });
      toastSuccess({
        title: t("assets.order.cancelOrderSuccess"),
      });
    } catch (error) {
      console.log("===> cancel order error", error);
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <button
      disabled={isCanceling}
      onClick={handleCancelOrder}
      className={cn(
        "cursor-pointer text-sm/5.5 font-medium text-[rgba(26,133,255,1)]",
        isCanceling && "opacity-50 cursor-not-allowed"
      )}
    >
      {isCanceling
        ? t("assets.order.cancelOrdering")
        : t("assets.order.cancelOrder")}
    </button>
  );
}
