import { TableHeader, TableBody } from '@/components/table-header'
import { useTableSort, type Order } from '@/hooks/useTableHelper'
import { type IAssetItem } from '../assetsList'
import RwaStateButton, { BuyButton } from '@/components/button/RwaStateButton'
import Pagination from '@/components/pagination'
import { usePaginationData } from '@/hooks/useTableHelper'
import { advancedSort } from '@/utils/sort'
import { TextCell, TokenCell } from '../Shared'
import { textPrefix, toFixed, formatWithCommas, truncate } from '@/utils/format'
import type { IRwa } from '@/service/base/types'
import { useBaseStore } from '@/stores/baseStore'
import type { ITableConfig } from '@/components/table-header'
import { symbolToLower } from '@/utils'
import { useRouter } from '@/hooks/useRouter'
import { useCallback } from 'react'
import IconWithTooltip from '@/components/icon-tooltip'

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
    usePaginationData<IAssetItem>(10, assetTableConfig, assetsList, sort, defaultSort)

  return (
    <>
      <TableHeader<SortableField, IAssetItem, { rwaList: IRwa[] }>
        className='mt-0 rounded-lg border-none text-gray-400 px-3 h-[32px]'
        thClassName='font-normal text-xs'
        lngPrefix='portfolio'
        config={assetTableConfig}
        sort={sort}
        onSortChange={onSortChange}
      />
      <TableBody<IAssetItem, { rwaList: IRwa[] }>
        data={paginatedData}
        tdClassName='h-[68px]'
        config={assetTableConfig}
        extra={{ rwaList } as { rwaList: IRwa[] }}
        getKey={(item: IAssetItem) => item.symbol}
        className='hover:bg-white/10 border-none cursor-pointer'
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
        <div className='mt-4'>
          <Pagination
            currentPage={currentPage}
            totalPage={totalPage}
            onPrevClick={onPrevClick}
            onNextClick={onNextClick}
          />
        </div>
      )}
    </>
  )
}

const assetTableConfig: ITableConfig<IAssetItem, { rwaList: IRwa[] }> = [
  {
    key: 'name',
    sortable: true,
    render: (item: IAssetItem) => (
      <>
        <TokenCell icon={item.icon} token={item.symbol} name={item.name} />
        {item.rwaState === 1 && (
          <IconWithTooltip
            triggerClassName='ml-2'
            icon='/images/v2/icons/trade_halt.svg'
            tooltip='portfolio.tH'
          />
        )}
      </>
    ),
    sorter: (a: IAssetItem, b: IAssetItem) => (order: Order) =>
      advancedSort(a.symbol, b.symbol, order),
  },
  {
    key: 'price',
    sortable: true,
    render: (item: IAssetItem) => {
      const price = item.tokenPrice ?? item.rwaPrice
      return <TextCell text={price ? textPrefix(truncate(price, item.precision), '$') : '--'} />
    },
    sorter: (a: IAssetItem, b: IAssetItem) => (order: Order) =>
      advancedSort(a.tokenPrice ?? a.rwaPrice ?? '0', b.tokenPrice ?? b.rwaPrice ?? '0', order),
  },
  {
    key: 'holdings',
    sortable: true,
    render: (item: IAssetItem) => (
      <div className='flex flex-col'>
        {item.holdings || item.value ? (
          <>
            <TextCell text={item.holdings ? formatWithCommas(item.holdings, 2) : '--'} />
            <TextCell
              className='text-gray-400'
              text={item.value ? textPrefix(formatWithCommas(item.value, 2), '$') : '--'}
            />
          </>
        ) : (
          <TextCell text={'--'} />
        )}
      </div>
    ),
    sorter: (a: IAssetItem, b: IAssetItem) => (order: Order) =>
      advancedSort(a.value ?? '0', b.value ?? '0', order),
  },
  {
    key: 'action',
    sortable: false,
    render: (item: IAssetItem, { rwaList }) => {
      const rwa = rwaList.find(rwa => rwa.symbol === item.symbol)
      // return !rwa ? '--' : <RwaStateButton rwa={rwa} />
      return !rwa ? '--' : <BuyButton rwa={rwa} />
    },
  },
]

export default AssetsTable
