import { TableHeader, TableBody } from '@/components/table-header'
import { useTableSort, type Order } from '@/hooks/useTableHelper'
import { type IAssetItem } from './assetsList'
import RwaStateButton from '@/components/button/RwaStateButton'
import Pagination from '@/components/pagination'
import { usePaginationData } from '@/hooks/useTableHelper'
import { advancedSort } from '@/utils/sort'
import { TextCell, TokenCell } from './Shared'
import { textPrefix, toFixed, formatWithCommas } from '@/utils/format'
import type { IRwa } from '@/service/base/types'
import { useBaseStore } from '@/stores/baseStore'
import type { ITableConfig } from '@/components/table-header'

type SortableField = 'value'
function AssetsTable(props: { chainId: number; account: string; assetsList: IAssetItem[] }) {
  const { assetsList } = props
  const { sort, onSortChange } = useTableSort<SortableField>()

  const rwaList = useBaseStore(state => state.rwaList)

  const { paginatedData, currentPage, totalPage, onPrevClick, onNextClick } =
    usePaginationData<IAssetItem>(assetTableConfig, assetsList, sort)

  return (
    <>
      <TableHeader<SortableField, IAssetItem, { rwaList: IRwa[] }>
        className='bg-[rgba(255,255,255,0.04)] rounded-lg border-none px-5'
        lngPrefix='assets.assetsTab'
        config={assetTableConfig}
        sort={sort}
        onSortChange={onSortChange}
      />
      <TableBody<IAssetItem, { rwaList: IRwa[] }>
        data={paginatedData}
        config={assetTableConfig}
        extra={{ rwaList } as { rwaList: IRwa[] }}
        getKey={(item: IAssetItem) => item.symbol}
        className='cursor-pointer hover:bg-white/10 rounded-lg border-none'
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
  )
}

const assetTableConfig: ITableConfig<IAssetItem, { rwaList: IRwa[] }> = [
  {
    key: 'token',
    sortable: false,
    render: (item: IAssetItem) => (
      <TokenCell icon={item.icon} token={item.symbol} name={item.name} />
    ),
  },
  {
    key: 'holdings',
    sortable: false,
    render: (item: IAssetItem) => (
      <TextCell text={item.holdings ? formatWithCommas(item.holdings, 2) : '--'} />
    ),
  },
  {
    key: 'price',
    sortable: false,
    render: (item: IAssetItem) => {
      const price = item.tokenPrice ?? item.rwaPrice
      return <TextCell text={price ? textPrefix(toFixed(price, 2), '$') : '--'} />
    },
  },
  {
    key: 'value',
    sortable: true,
    render: (item: IAssetItem) => (
      <TextCell text={item.value ? textPrefix(formatWithCommas(item.value, 2), '$') : '--'} />
    ),
    sorter: (a: IAssetItem, b: IAssetItem) => (order: Order) =>
      advancedSort(a.value ?? '0', b.value ?? '0', order),
  },
  {
    key: 'actions',
    sortable: false,
    render: (item: IAssetItem, { rwaList }) => {
      const rwa = rwaList.find(rwa => rwa.symbol === item.symbol)
      return !rwa ? '--' : <RwaStateButton rwa={rwa} />
    },
  },
]

export default AssetsTable
