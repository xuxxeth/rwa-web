import { TableHeader, TableBody } from "@/components/table-header";
import { useTableSort, type Order } from "@/hooks/useTableHelper";
import { type IAssetItem } from "./assetsList";
import BuyButton from "@/components/button/BuyButton";
import TradingHaltBtn from "@/components/button/TradingHaltBtn";
import Pagination from "@/components/pagination";
import { usePaginationData } from "@/hooks/useTableHelper";
import { advancedSort } from "@/utils/sort";
import { TextCell, TokenCell } from "./Shared"
import { textPrefix, toFixed } from "@/utils/format";

type SortableField = "value";
function AssetsTable(props: {
  chainId: number;
  account: string;
  assetList: IAssetItem[];
}) {
  const { assetList } = props;
  const { sort, onSortChange } = useTableSort<SortableField>();

  const { paginatedData, currentPage, totalPage, onPrevClick, onNextClick } =
    usePaginationData<IAssetItem>(assetTableConfig, assetList, sort);

  return (
    <>
      <TableHeader<SortableField, IAssetItem, unknown>
        className="bg-[rgba(255,255,255,0.04)] rounded-lg border-none px-5"
        lngPrefix="assets.assetsTab"
        config={assetTableConfig}
        sort={sort}
        onSortChange={onSortChange}
      />
      <TableBody<IAssetItem, unknown>
        data={paginatedData}
        config={assetTableConfig}
        extra={{} as unknown}
        getKey={(item: IAssetItem) => item.token}
      />
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

const assetTableConfig = [
  {
    key: "token",
    sortable: false,
    render: (item: IAssetItem) => (
      <TokenCell icon={item.icon} token={item.token} name={item.name} />
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
