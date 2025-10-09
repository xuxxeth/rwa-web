import TableHeader from "@/components/table-header";
import { useTableSort, type Order } from "@/hooks/useTableHelper";
import { type IAssetItem } from "./assetsList";
import BuyButton from "@/components/button/BuyButton";
import TradingHaltBtn from "@/components/button/TradingHaltBtn";
import { LazyImage } from "@/components/image/LazyImage";
import { textPrefix, toFixed } from "@/utils/format";
import Pagination from "@/components/pagination";
import { usePaginationData } from "@/hooks/useTableHelper";
import { advancedSort } from "@/utils/sort";

type SortableField = "value";
function AssetsTable(props: {
  chainId: number;
  account: string;
  assetList: IAssetItem[];
}) {
  const { assetList } = props;
  const { sort, onSortChange } = useTableSort<SortableField>();

  const { paginatedData, currentPage, totalPage, onPrevClick, onNextClick } =
    usePaginationData<IAssetItem>(assetConfig, assetList, sort);

  return (
    <>
      <TableHeader
        className="bg-[rgba(255,255,255,0.04)] rounded-lg border-none px-5"
        lngPrefix="assets.assetsTab"
        config={assetConfig}
        sort={sort}
        onSortChange={onSortChange}
      />
      {paginatedData.map((item: IAssetItem) => {
        return (
          <div className="flex flex-row px-5 border-b border-white/10">
            {assetConfig.map(({ render }) => {
              return (
                <div className="flex flex-row items-center flex-1 h-20">
                  {render(item)}
                </div>
              );
            })}
          </div>
        );
      })}
      {totalPage > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPage={totalPage}
          onPrevClick={onPrevClick}
          onNextClick={onNextClick}
        />
      )}
    </>
  );
}

function TextCell(props: { text: string }) {
  return <div className="text-sm font-normal">{props.text}</div>;
}

const assetConfig = [
  {
    key: "token",
    sortable: false,
    render: (item: IAssetItem) => (
      <div className="flex flex-row gap-2">
        {item.icon && <LazyImage className="w-10 h-10" src={item.icon || ""} />}
        <div className="flex flex-col">
          <div className="text-sm/6">{item.token}</div>
          <div className="text-60 text-xs/4.5">{item.name}</div>
        </div>
      </div>
    ),
  },
  {
    key: "holdings",
    sortable: false,
    render: (item: IAssetItem) => (
      <TextCell text={item.holdings ? toFixed(item.holdings, 4) : "--"} />
    ),
  },
  {
    key: "price",
    sortable: false,
    render: (item: IAssetItem) => {
      const price = item.tokenPrice ?? item.rwaPrice;
      return (
        <TextCell text={price ? textPrefix(toFixed(price, 2), "$") : "--"} />
      );
    },
  },
  {
    key: "value",
    sortable: true,
    render: (item: IAssetItem) => (
      <TextCell
        text={item.value ? textPrefix(toFixed(item.value, 2), "$") : "--"}
      />
    ),
    sorter: (a: IAssetItem, b: IAssetItem) => (order: Order) =>
      advancedSort(a.value ?? "0", b.value ?? "0", order),
  },
  {
    key: "actions",
    sortable: false,
    render: (item: IAssetItem) =>
      item.rwaState === undefined ? (
        "--"
      ) : item.rwaState === 0 ? (
        <BuyButton to={"/markets/trading"} />
      ) : (
        <TradingHaltBtn />
      ),
  },
];

export default AssetsTable;
