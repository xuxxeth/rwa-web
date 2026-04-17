import { MainLayout } from '@/layouts/main'
import ConentLayout from '@/layouts/content'
import { useTranslation } from '@/hooks/useTranslation'
import { type Order, useTableSort, usePaginationData } from '@/hooks/useTableHelper'
import {
  advancedSort,
  textPrefix,
  strOrNumToSign,
  multiply,
  formatLargeNumber,
  fuzzySearch,
  formatUp,
  calculateUp,
} from '@/utils'
import Pagination from '@/components/pagination'
import { type IMarketQuote } from '@/service/quote/types'
import { TableHeader, TableBody } from '@/components/table-header'
import { useRwaTokens } from '@/hooks/useTokens'
import wsService from '@/service/webSocket/service'
import { type ISummaryData } from '@/service/webSocket/types'
import { type IQuote } from '@/service/quote/types'
import { useEffect, useState, useMemo } from 'react'
import { truncate } from '@/utils'
import { useRouter } from '@/hooks/useRouter'
import IconWithTooltip from '@/components/icon-tooltip'
import SearchFilter from './SearchFilter'
import useFavorites from '@/hooks/useFavorites'
import type { IRwa } from '@/service/base/types'
import { PreMarketOpen } from '@/components/markets/PreMarketOpen'
import {
  NoDataReason,
  TextCellWithColor,
  TextCell,
  QuoteName,
  TradeState,
  SessionType,
} from './shared'
import { useBaseStore } from '@/stores/baseStore'
import { MarketStatus } from '@/components/markets/MarketStatus'

type SortableField = 'name' | 'token' | 'price' | 'change' | 'marketCap' | 'dailyHigh'

export function useRwaListWithQuote(rwaList: IRwa[]) {
  const [tokenWithQuote, setTokenWithQuote] = useState<Record<string, IQuote>>({})

  const rwaListWithQuote = useMemo(() => {
    return rwaList.map(rwa => {
      const stockId = rwa.stockId
      const quote = tokenWithQuote[stockId]

      return {
        ...rwa,
        ...quote,
        marketCap: quote?.price
          ? multiply(quote.price, rwa.stockStatistics?.totalShare || 0)
          : undefined,
        floatCap: quote?.price
          ? multiply(quote.price, rwa.stockStatistics?.circShare || 0)
          : undefined,
      }
    })
  }, [rwaList, tokenWithQuote])

  useEffect(() => {
    const listener = (data: ISummaryData) => {
      const obj = data.reduce(
        (acc, item) => {
          acc[item.s] = {
            // 最新价
            price: item.p,
            // 24 小时价格涨跌幅, o 今开价(24小时开始价格)
            up: item.p && item.o ? calculateUp(item.p, item.o) : undefined,
            dailyHigh: item.h,
            dailyLow: item.l,
          }
          return acc
        },
        {} as Record<number, IQuote>
      )
      if (data.length > 10) {
        setTokenWithQuote(obj)
      }
    }

    wsService.on('summary', listener)

    return () => {
      wsService.off('summary', listener)
    }
  }, [])

  return rwaListWithQuote
}

interface ITableExtra {
  toggleFavorite: (stockId: number) => void
  toggleEnable: boolean
  isFavorite: (stockId: number) => boolean
  marketTradeState: number
}

export default function MarketQuotes() {
  const { t } = useTranslation()
  const { sort, onSortChange } = useTableSort<SortableField>()
  const router = useRouter()

  const marketTradeState = useBaseStore(state => state.marketTradeState)

  const rwaList = useRwaTokens(false)

  const [isFavorites, setIsFavorites] = useState(false)

  const { favorites, isFavorite, ...favoritesRest } = useFavorites()

  const [searchText, setSearchText] = useState('')

  const rwaMap = useMemo(() => new Map(rwaList.map(rwa => [rwa.stockId, rwa])), [rwaList])

  const newRwaList = useMemo(() => {
    let rwaListFiltered = rwaList
    if (isFavorites) {
      rwaListFiltered = favorites
        .map(stockId => rwaMap.get(stockId))
        .filter(rwa => rwa !== undefined)
    }
    return rwaListFiltered.filter(
      rwa => !searchText || fuzzySearch(rwa.symbol, searchText) || fuzzySearch(rwa.name, searchText)
    )
  }, [rwaList, isFavorites, favorites, isFavorite, searchText])

  const marketQuotes = useRwaListWithQuote(newRwaList)

  const { paginatedData, totalPage, currentPage, setPage, onPrevClick, onNextClick } =
    usePaginationData<IMarketQuote>(20, MarketQuotesListConfig, marketQuotes, sort)

  useEffect(() => {
    if (paginatedData.length === 0 && currentPage >= 1) {
      setPage(currentPage - 1)
    }
  }, [isFavorite, paginatedData.length, currentPage])

  return (
    <MainLayout>
      <ConentLayout>
        <div className='mb-20'>
          {/* <MarketTrading align='center' /> */}
          <div className='flex flex-row px-6 items-center'>
            <div className='flex-1'>
              <SearchFilter
                searchText={searchText}
                onSearchChange={(newSearch: string) => {
                  setSearchText(newSearch)
                  setPage(1)
                }}
                isFavorites={isFavorites}
                onFavoriteChange={newIsFavorites => {
                  setPage(1)
                  setIsFavorites(newIsFavorites)
                }}
              />
            </div>
            <div>
              <MarketStatus />
            </div>
          </div>

          <TableHeader<SortableField, IMarketQuote, ITableExtra>
            lngPrefix='marketQuotes'
            config={MarketQuotesListConfig}
            sort={sort}
            className='px-6 border-t-0'
            onSortChange={onSortChange}
            thClassName={'text-xs/[15px] text-gray-400 font-normal'}
          />
          {paginatedData.length === 0 && (
            <NoDataReason isFavorites={isFavorites} {...favoritesRest} />
          )}
          <TableBody<IMarketQuote, ITableExtra>
            data={paginatedData}
            config={MarketQuotesListConfig}
            extra={{
              toggleFavorite: favoritesRest.toggleFavorite,
              toggleEnable: favoritesRest.toggleEnable,
              isFavorite,
              marketTradeState,
            }}
            getKey={(item: IMarketQuote) => item.symbol}
            className='px-6 cursor-pointer hover:bg-white/4'
            onClick={(item: IMarketQuote) => {
              router.push('/trade/' + item.symbol)
            }}
          />
          {paginatedData.length > 0 && (
            <div className='px-6 py-2 mt-2 mb-4 text-sm/4.5 font-normal text-gray-400'>
              {t('marketQuotes.quoteInfo')}
            </div>
          )}
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
        </div>
      </ConentLayout>
    </MainLayout>
  )
}

const MarketQuotesListConfig = [
  {
    key: 'name',
    sortable: true,
    width: 280,
    render: (item: IMarketQuote, extra: ITableExtra) => (
      <div className='flex flex-row pr-6 items-center overflow-hidden'>
        <QuoteName
          isFavorite={extra.isFavorite(item.stockId)}
          toggleEnable={extra.toggleEnable}
          toggleFavorite={extra.toggleFavorite}
          logo={item.icon || ''}
          stockId={item.stockId}
          symbol={item.symbol}
          name={item.name}
        />
        <TradeState state={item.state} />
        <SessionType sessionMask={item.sessionMask} />
      </div>
    ),
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.symbol, b.symbol, order),
  },
  // {
  //   key: 'token',
  //   sortable: true,
  //   render: (item: IMarketQuote) => <TextCell text={item.symbol} />,
  //   sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
  //     advancedSort(a.symbol, b.symbol, order),
  // },
  {
    key: 'price',
    sortable: true,
    render: (item: IMarketQuote) => {
      return (
        <TextCellWithColor
          text={item.price ? textPrefix(truncate(item.price, item.precision), '$') : '--'}
          change={strOrNumToSign(item.up ?? '0')}
          withIcon={false}
        />
      )
    },
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.price, b.price, order),
  },
  {
    key: 'change',
    sortable: true,
    render: (item: IMarketQuote) => {
      return (
        <TextCellWithColor
          text={item.up !== undefined ? formatUp(item.up) : '--'}
          change={strOrNumToSign(item.up ?? 0)}
          withIcon={false}
        />
      )
    },
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) => advancedSort(a.up, b.up, order),
  },
  {
    key: 'dailyHigh',
    sortable: false,
    render: (item: IMarketQuote) => (
      <TextCell
        className='text-sm/4.5 font-normal'
        text={item.dailyHigh ? textPrefix(truncate(item.dailyHigh, item.precision), '$') : '--'}
      />
    ),
  },
  {
    key: 'dailyLow',
    sortable: false,
    render: (item: IMarketQuote) => (
      <TextCell
        className='text-sm/4.5 font-normal'
        text={item.dailyLow ? textPrefix(truncate(item.dailyLow, item.precision), '$') : '--'}
      />
    ),
  },
  {
    key: 'marketCap',
    sortable: true,
    render: (item: IMarketQuote) => (
      <TextCell
        className='text-sm/4.5 font-normal'
        text={item.marketCap ? formatLargeNumber(item.marketCap) : '--'}
      />
    ),
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.marketCap, b.marketCap, order),
  },
  {
    key: 'floatCap',
    sortable: true,
    render: (item: IMarketQuote) => (
      <TextCell
        className='text-sm/4.5 font-normal'
        text={item.floatCap ? formatLargeNumber(item.floatCap) : '--'}
      />
    ),
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.floatCap, b.floatCap, order),
  },
]
