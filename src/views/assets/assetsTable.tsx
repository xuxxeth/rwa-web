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
import { symbolToLower } from '@/utils'
import { useRouter } from '@/hooks/useRouter'
import { useCallback } from 'react'

type SortableField = 'value'

function AssetsTable(props: { chainId: number; account: string; assetsList: IAssetItem[] }) {
  const { assetsList } = props

  const { sort, onSortChange } = useTableSort<SortableField>()
  const router = useRouter()

  const rwaList = useBaseStore(state => state.rwaList)

  const defaultSort = useCallback((item1: IAssetItem, item2: IAssetItem) => {
    const isItem1Rwa = Boolean(item1.rwaId)
    const isItem2Rwa = Boolean(item2.rwaId)

    if (!isItem1Rwa && isItem2Rwa) return -1
    if (isItem1Rwa && !isItem2Rwa) return 1

    if (item1.value !== item2.value) {
      return advancedSort(item1.value, item2.value, 'desc')
    } else if (item1.holdings !== item2.holdings) {
      return advancedSort(item1.holdings, item2.holdings, 'desc')
    } else {
      return advancedSort(item1.weight, item2.weight, 'desc')
    }
  }, [])

  const { paginatedData, currentPage, totalPage, onPrevClick, onNextClick } =
    usePaginationData<IAssetItem>(20, assetTableConfig, assetsList, sort, defaultSort)

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
        className='hover:bg-white/10 rounded-lg border-none cursor-pointer'
        onClick={(item: IAssetItem) => {
          if (item.rwaId) {
            const rwa = rwaList.find(rwa => rwa.id === item.rwaId)
            if (rwa) {
              router.push('/trade/' + item.symbol)
            }
          }
        }}
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
      return <TextCell text={price ? textPrefix(toFixed(price, item.precision), '$') : '--'} />
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
