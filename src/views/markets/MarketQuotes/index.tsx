import { useState, useMemo, useCallback } from "react";
import { MainLayout } from "@/layouts/main";
import { MarketTrading } from "@/components/market-trading";
import { SortButton } from "@/components/sort-button-svg";
import { useTranslation } from "@/hooks/useTranslation";
import { baseApi } from "@/service/baseApi";
import { useQuery } from "@tanstack/react-query";
import { useChainId } from "@/hooks/useCaCommon";
import { LazyImage } from "@/components/image/LazyImage";
import {
  cn,
  advancedSort,
  textPrefix,
  strOrNumToSign,
  formatPercentage,
  formatLargeNumber,
  type Change,
} from "@/utils";
import BuyButton from "@/components/button/BuyButton";
import Pagination from "@/components/pagination";
import { type MarketQuoteResponse, type MarketQuote } from "./types";
import type { AxiosError } from "axios";
import MarketQuoteError from "./error";
import { bscTestnet } from '@/hooks/useCaCommon'

function useMarketQuote() {
  const chainId = useChainId() || bscTestnet.id;

  const { data, isPending, status, isError, error } = useQuery<
    MarketQuoteResponse,
    AxiosError,
    MarketQuoteResponse
  >({
    queryKey: ["marketQuotes", chainId],
    queryFn: () => baseApi.getRWAs<MarketQuoteResponse>(chainId),
    enabled: chainId !== null,
  });

  return {
    marketQuotes: data?.data || [],
    isPending,
    status,
    isError,
    error,
  };
}

function usePaginationData(data: MarketQuote[], sort: Sort) {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const sorter = useMemo(() => {
    if (!sort) return undefined;
    return MarketQuotesList.find((item) => item.key === sort?.field)?.sorter;
  }, [sort]);

  const sortedData = useMemo(() => {
    if (!sort || !sorter) return data;
    return [...data].sort((a, b) => sorter(a, b)(sort.order));
  }, [data, sort, sorter]);

  const paginatedData = sortedData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = Math.ceil(sortedData.length / pageSize);

  return {
    paginatedData: paginatedData,
    currentPage: page,
    totalPages,
    setPage,
    pageSize,
  };
}

type SortableField =
  | "name"
  | "token"
  | "price"
  | "change"
  | "marketCap"
  | "dailyHigh";
type Order = "asc" | "desc";
type Sort = {
  field: SortableField;
  order: Order;
} | null;

export default function MarketQuotes() {
  const { t } = useTranslation();
  const [sort, setSort] = useState<Sort | null>(null);

  const onSortChange = useCallback<(filed: SortableField) => void>((field) => {
    setSort((prev: Sort | null) => {
      if (prev === null || prev.field !== field) {
        return { field, order: "asc" };
      }
      if (prev.order === "asc") {
        return { field, order: "desc" };
      }
      if (prev.order === "desc") {
        return null;
      }
      return null;
    });
  }, []);

  const { marketQuotes, isError, isPending, status, error } = useMarketQuote();

  const { paginatedData, currentPage, totalPages, setPage } = usePaginationData(
    marketQuotes,
    sort
  );

  if (isPending) {
    // TODO: 加载中状态
    return null;
  }

  if (isError) {
    return <MarketQuoteError />;
  }

  return (
    <MainLayout>
      <div className="bg-[rgba(7,8,13,1)] min-h-[100vh] pt-[88px] text-white ">
        <div className="px-5">
          <MarketTrading state="open" align="center" />
          <TableTitle sort={sort} onSortChange={onSortChange} />
          {paginatedData.map((item: MarketQuote) => {
            return (
              <div className="flex flex-row px-4 border-b border-white/10">
                {MarketQuotesList.map(({ render }) => {
                  return (
                    <div className="flex flex-row items-center flex-1 h-20">
                      {render(item)}
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div className="px-5 py-1 mt-2 text-sm/5.5">
            {t("marketQuotes.quoteInfo")}
          </div>
          {totalPages > 1 && (
            <div className="flex gap-4 py-2 mt-9 flew-row justify-center">
              <Pagination
                prev={{
                  disabled: currentPage === 1,
                  onClick: () => {
                    setPage((s) => s - 1);
                    ScrollToTop();
                  },
                }}
                next={{
                  disabled: currentPage === totalPages,
                  onClick: () => {
                    setPage((s) => s + 1);
                    ScrollToTop();
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// 分页切换的时候，滚动到顶部
function ScrollToTop() {
  window.scrollTo({ top: 0, behavior: "auto" });
}

function TableTitle({
  sort,
  onSortChange,
}: {
  sort: Sort;
  onSortChange: (field: SortableField) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex px-4 mt-2 flex-row h-12 border-t border-b border-white/10">
      {MarketQuotesList.map(({ key, sortable }) => {
        const order = sort?.field === key ? sort.order : undefined;
        return (
          <div
            key={key}
            className="flex-1 text-white/60 text-sm/11.5 font-medium"
          >
            <button
              className="cursor-pointer flex flex-row items-center"
              onClick={() => {
                onSortChange(key as SortableField);
              }}
            >
              <span className="mr-0.5">{t(`marketQuotes.${key}`)}</span>
              {sortable && (
                <div className="w-4 h-4 flex justify-center flex-row items-center">
                  <SortButton order={order} />
                </div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function QuoteName(props: { logo: string; name: string }) {
  return (
    <>
      <LazyImage
        src={"/images/icons/chains/bsc.png"}
        className="w-10 h-10 mr-2"
      />
      <TextCell text={props.name} />
    </>
  );
}

function TextCell(props: { text: string; className?: string; icon?: string }) {
  return (
    <div className={cn("flex flex-row gap-1 items-center ", props.className)}>
      {props.icon && <LazyImage className="w-2 h-2" src={props.icon} />}
      <span className="text-base/6 h-6 font-medium">{props.text}</span>
    </div>
  );
}

function getColorAndIcon(change: Change) {
  switch (change) {
    case 0:
      return { color: "stock-even", icon: "" };
    case 1:
      return { color: "stock-rise", icon: "/images/convert/price_up.png" };
    case -1:
      return { color: "stock-fall", icon: "/images/convert/price_down.png" };
    default:
      return { color: "stock-even", icon: "" };
  }
}

function TextCellWithColor(props: {
  text: string;
  change: Change;
  withIcon: boolean;
}) {
  const { icon, color } = getColorAndIcon(props.change);

  return (
    <TextCell
      text={props.text}
      className={color}
      icon={props.withIcon ? icon : ""}
    />
  );
}
const MarketQuotesList = [
  {
    key: "name",
    sortable: true,
    render: (item: MarketQuote) => (
      <QuoteName logo={item.icon || ""} name={item.name} />
    ),
    sorter: (a: MarketQuote, b: MarketQuote) => (order: Order) =>
      advancedSort(a.name, b.name, order),
  },
  {
    key: "token",
    sortable: true,
    render: (item: MarketQuote) => <TextCell text={item.token} />,
    sorter: (a: MarketQuote, b: MarketQuote) => (order: Order) =>
      advancedSort(a.token, b.token, order),
  },
  {
    key: "price",
    sortable: true,
    render: (item: MarketQuote) => (
      <TextCellWithColor
        text={textPrefix(item.price, "$")}
        change={strOrNumToSign(item.change)}
        withIcon={false}
      />
    ),
    sorter: (a: MarketQuote, b: MarketQuote) => (order: Order) =>
      advancedSort(a.price, b.price, order),
  },
  {
    key: "change",
    sortable: true,
    render: (item: MarketQuote) => (
      <TextCellWithColor
        text={formatPercentage(item.change)}
        change={strOrNumToSign(item.change)}
        withIcon={true}
      />
    ),
    sorter: (a: MarketQuote, b: MarketQuote) => (order: Order) =>
      advancedSort(a.change, b.change, order),
  },
  {
    key: "marketCap",
    sortable: true,
    render: (item: MarketQuote) => (
      <TextCell text={textPrefix(formatLargeNumber(item.marketcap), "$")} />
    ),
    sorter: (a: MarketQuote, b: MarketQuote) => (order: Order) =>
      advancedSort(a.marketcap, b.marketcap, order),
  },
  {
    key: "dailyHigh",
    sortable: true,
    render: (item: MarketQuote) => (
      <TextCell text={textPrefix(item.dailyhigh, "$")} />
    ),
    sorter: (a: MarketQuote, b: MarketQuote) => (order: Order) =>
      advancedSort(a.dailyhigh, b.dailyhigh, order),
  },
  {
    key: "quickBuy",
    sortable: false,
    render: () => <BuyButton to={"/markets/trading"} />,
  },
];
