import { MainLayout } from "@/layouts/main";
import ConentLayout from "@/layouts/content";
import { MarketTrading } from "@/components/market-trading";
import { useTranslation } from "@/hooks/useTranslation";
import { useQuery } from "@tanstack/react-query";
import { useChainId } from "@/hooks/useCaCommon";
import { LazyImage } from "@/components/image/LazyImage";
import {
  type Order,
  useTableSort,
  usePaginationData,
} from "@/hooks/useTableHelper";
import {
  cn,
  advancedSort,
  textPrefix,
  strOrNumToSign,
  formatPercentage,
  formatLargeNumber,
  toFixed,
  type Change,
} from "@/utils";
import BuyButton from "@/components/button/BuyButton";
import TradingHaltBtn from "@/components/button/TradingHaltBtn";
import Pagination from "@/components/pagination";
import { type IMarketQuote } from "@/service/quote/types"
import MarketQuoteError from "./error";
import { bscTestnet } from "@/hooks/useCaCommon";
import { marketQuoteOptions } from "@/queries";
import TableHeader from "@/components/table-header";

function useMarketQuote() {
  const chainId = useChainId() || bscTestnet.id;

  const { data, isPending, status, isError, error } = useQuery(
    marketQuoteOptions(chainId)
  );

  return {
    marketQuotes: data ?? [],
    isPending,
    status,
    isError,
    error,
  };
}

type SortableField =
  | "name"
  | "token"
  | "price"
  | "change"
  | "marketCap"
  | "dailyHigh";

export default function MarketQuotes() {
  const { t } = useTranslation();
  const { sort, onSortChange } = useTableSort<SortableField>();

  const { marketQuotes, isError, isPending, status, error } = useMarketQuote();

  const { paginatedData, totalPage, currentPage, onPrevClick, onNextClick } =
    usePaginationData<IMarketQuote>(MarketQuotesList, marketQuotes, sort);

  // TODO: 增加 loading 态
  if (isPending) {
    return "loading...";
  }

  if (isError) {
    return <MarketQuoteError />;
  }

  return (
    <MainLayout>
      <ConentLayout>
        <div className="px-5">
          <MarketTrading state="open" align="center" />
          <TableHeader<SortableField>
            lngPrefix="marketQuotes"
            config={MarketQuotesList}
            sort={sort}
            onSortChange={onSortChange}
          />
          {paginatedData.map((item: IMarketQuote) => {
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
          {totalPage > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPage={totalPage}
              onPrevClick={onPrevClick}
              onNextClick={onNextClick}
            />
          )}
        </div>
      </ConentLayout>
    </MainLayout>
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
    render: (item: IMarketQuote) => (
      <QuoteName logo={item.icon || ""} name={item.name} />
    ),
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.name, b.name, order),
  },
  {
    key: "token",
    sortable: true,
    render: (item: IMarketQuote) => <TextCell text={item.token} />,
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.token, b.token, order),
  },
  {
    key: "price",
    sortable: true,
    render: (item: IMarketQuote) => (
      <TextCellWithColor
        text={textPrefix(toFixed(item.price), "$")}
        change={strOrNumToSign(item.change)}
        withIcon={false}
      />
    ),
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.price, b.price, order),
  },
  {
    key: "change",
    sortable: true,
    render: (item: IMarketQuote) => (
      <TextCellWithColor
        text={formatPercentage(item.change)}
        change={strOrNumToSign(item.change)}
        withIcon={true}
      />
    ),
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.change, b.change, order),
  },
  {
    key: "marketCap",
    sortable: true,
    render: (item: IMarketQuote) => (
      <TextCell text={textPrefix(formatLargeNumber(item.marketCap), "$")} />
    ),
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.marketCap, b.marketCap, order),
  },
  {
    key: "dailyHigh",
    sortable: true,
    render: (item: IMarketQuote) => (
      <TextCell text={textPrefix(toFixed(item.dailyHigh), "$")} />
    ),
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.dailyHigh, b.dailyHigh, order),
  },
  {
    key: "quickBuy",
    sortable: false,
    render: (item: IMarketQuote) =>
      item.rwaState === 0 ? (
        <BuyButton to={"/markets/trading"} />
      ) : (
        <TradingHaltBtn />
      ),
  },
];
