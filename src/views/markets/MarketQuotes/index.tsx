import { MainLayout } from '@/layouts/main'
import ConentLayout from '@/layouts/content'
import { MarketTrading } from '@/components/market-trading'
import { useTranslation } from '@/hooks/useTranslation'
import { useQuery } from '@tanstack/react-query'
import { useChainId } from '@/hooks/useCaCommon'
import { LazyImage } from '@/components/image/LazyImage'
import { type Order, useTableSort, usePaginationData } from '@/hooks/useTableHelper'
import {
  cn,
  advancedSort,
  textPrefix,
  strOrNumToSign,
  formatPercentage,
  formatLargeNumber,
  toFixed,
  type Change,
  symbolToLower,
} from '@/utils'
import BuyButton from '@/components/button/BuyButton'
import TradingHaltBtn from '@/components/button/TradingHaltBtn'
import Pagination from '@/components/pagination'
import { type IMarketQuote } from '@/service/quote/types'
import MarketQuoteError from './error'
import { bscTestnet } from '@/hooks/useCaCommon'
import { marketQuoteOptions } from '@/queries'
import { TableHeader, TableBody } from '@/components/table-header'
import { useRwaTokens } from '@/hooks/useTokens'

import { useBaseStore } from '@/stores/baseStore'

function useMarketQuote() {
  const chainId = useChainId() || bscTestnet.id

  const { data, isPending, status, isError, error } = useQuery(marketQuoteOptions(chainId))

  return {
    marketQuotes: data ?? [],
    isPending,
    status,
    isError,
    error,
  }
}

type SortableField = 'name' | 'token' | 'price' | 'change' | 'marketCap' | 'dailyHigh'

export default function MarketQuotes() {
  const { t } = useTranslation()
  const { sort, onSortChange } = useTableSort<SortableField>()

  const rwaList = useRwaTokens()

  const tokenWithPrice = useBaseStore(state => state.tokenWithPrice)

  const marketQuotes: IMarketQuote[] = rwaList.map(rwa => {
    const priceFromStore = tokenWithPrice[symbolToLower(rwa.symbol)]
    return {
      ...rwa,
      price: priceFromStore?.price,
      up: priceFromStore?.up,
      dailyHigh: priceFromStore?.dailyHigh,
    }
  })

  const { paginatedData, totalPage, currentPage, onPrevClick, onNextClick } =
    usePaginationData<IMarketQuote>(MarketQuotesList, marketQuotes, sort)

  return (
    <MainLayout>
      <ConentLayout>
        <div className='px-5'>
          <MarketTrading state={2} align='center' />
          <TableHeader<SortableField, IMarketQuote, unknown>
            lngPrefix='marketQuotes'
            config={MarketQuotesList}
            sort={sort}
            onSortChange={onSortChange}
          />
          <TableBody<IMarketQuote, unknown>
            data={paginatedData}
            config={MarketQuotesList}
            extra={{} as unknown}
            getKey={(item: IMarketQuote) => item.symbol}
          />
          <div className='px-5 py-1 mt-2 text-sm/5.5'>{t('marketQuotes.quoteInfo')}</div>
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
  )
}

function QuoteName(props: { logo: string; name: string }) {
  return (
    <>
      <LazyImage src={'/images/icons/chains/bsc.png'} className='w-10 h-10 mr-2' />
      <TextCell text={props.name} />
    </>
  )
}

function TextCell(props: { text: string; className?: string; icon?: string }) {
  return (
    <div className={cn('flex flex-row gap-1 items-center ', props.className)}>
      {props.icon && <LazyImage className='w-2 h-2' src={props.icon} />}
      <span className='text-base/6 h-6 font-medium'>{props.text}</span>
    </div>
  )
}

function getColorAndIcon(change: Change) {
  switch (change) {
    case 0:
      return { color: 'stock-even', icon: '' }
    case 1:
      return { color: 'stock-rise', icon: '/images/convert/price_up.png' }
    case -1:
      return { color: 'stock-fall', icon: '/images/convert/price_down.png' }
    default:
      return { color: 'stock-even', icon: '' }
  }
}

function TextCellWithColor(props: { text: string; change: Change; withIcon: boolean }) {
  const { icon, color } = getColorAndIcon(props.change)

  return <TextCell text={props.text} className={color} icon={props.withIcon ? icon : ''} />
}
const MarketQuotesList = [
  {
    key: 'name',
    sortable: true,
    render: (item: IMarketQuote) => <QuoteName logo={item.icon || ''} name={item.name} />,
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.name, b.name, order),
  },
  {
    key: 'token',
    sortable: true,
    render: (item: IMarketQuote) => <TextCell text={item.symbol} />,
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.symbol, b.symbol, order),
  },
  {
    key: 'price',
    sortable: true,
    render: (item: IMarketQuote) => (
      <TextCellWithColor
        text={item.price ? textPrefix(toFixed(item.price), '$') : '--'}
        change={strOrNumToSign(item.up ?? '0')}
        withIcon={false}
      />
    ),
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.price, b.price, order),
  },
  {
    key: 'change',
    sortable: true,
    render: (item: IMarketQuote) => (
      <TextCellWithColor
        text={item.up ? formatPercentage(item.up) : '--'}
        change={strOrNumToSign(item.up ?? 0)}
        withIcon={true}
      />
    ),
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) => advancedSort(a.up, b.up, order),
  },
  {
    key: 'dailyHigh',
    sortable: true,
    render: (item: IMarketQuote) => (
      <TextCell text={item.dailyHigh ? textPrefix(toFixed(item.dailyHigh), '$') : '--'} />
    ),
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.dailyHigh, b.dailyHigh, order),
  },
  {
    key: 'quickBuy',
    sortable: false,
    render: (item: IMarketQuote) =>
      item.state === 0 ? <BuyButton to={'/markets/trading'} /> : <TradingHaltBtn />,
  },
]
