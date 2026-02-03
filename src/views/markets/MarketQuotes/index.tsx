import { MainLayout } from '@/layouts/main'
import ConentLayout from '@/layouts/content'
import { MarketTrading } from '@/components/market-trading'
import { useTranslation } from '@/hooks/useTranslation'
import { LazyImage } from '@/components/image/LazyImage'
import { type Order, useTableSort, usePaginationData } from '@/hooks/useTableHelper'
import {
  cn,
  advancedSort,
  textPrefix,
  textSuffix,
  strOrNumToSign,
  toFixed,
  type Change,
  symbolToLower,
  multiply,
  formatLargeNumber,
} from '@/utils'
import Pagination from '@/components/pagination'
import { type IMarketQuote } from '@/service/quote/types'
import { TableHeader, TableBody } from '@/components/table-header'
import { useRwaTokens } from '@/hooks/useTokens'
import wsService from '@/service/webSocket/service'
import { type ISummaryData } from '@/service/webSocket/types'
import { type IQuote } from '@/service/quote/types'
import { useEffect, useState, useMemo } from 'react'
import { truncate, divide, subtract } from '@/utils'
import { useRouter } from '@/hooks/useRouter'
import { useTradeStore } from '@/stores/tradeStore'
import IconWithTooltip from '@/components/icon-tooltip'
import SearchFilter from './SearchFilter'
import NoRecord from '@/components/no-record'
import useFavorites from '@/hooks/useFavorites'
import { WalletNotConnectedSmallVersion } from '@/components/wallet-not-connected'
import SignatureVerify from '@/components/signature-verify'

type SortableField = 'name' | 'token' | 'price' | 'change' | 'marketCap' | 'dailyHigh'

export default function MarketQuotes() {
  const { t } = useTranslation()
  const { sort, onSortChange } = useTableSort<SortableField>()
  const router = useRouter()
  const updateInputToken = useTradeStore(state => state.updateInputToken)

  const rwaList = useRwaTokens(false)

  const [isFavorites, setIsFavorites] = useState(false)

  const { favoritesSet, isFavorite, ...favoritesRest } = useFavorites()

  const [tokenWithQuote, setTokenWithQuote] = useState<Record<string, IQuote>>({})

  const [searchText, setSearchText] = useState('')

  const rwaListWithFavorite = useMemo(() => {
    let rwaListFiltered = rwaList
    if (isFavorites) {
      rwaListFiltered = rwaList.filter(rwa => favoritesSet.has(rwa.stockId))
    }
    return rwaListFiltered.map(item => ({
      ...item,
      isFavorite: isFavorite(item.stockId),
    }))
  }, [rwaList, isFavorites, favoritesSet, isFavorite, favoritesRest.toggleEnable])

  const marketQuotes: IMarketQuote[] = rwaListWithFavorite
    .filter(
      rwa => !searchText || rwa.symbol.toLowerCase().includes(searchText.trim().toLowerCase())
    )
    .map(rwa => {
      const quote = tokenWithQuote[symbolToLower(rwa.symbol)]

      return {
        ...rwa,
        price: quote?.price,
        up: quote?.up,
        dailyHigh: quote?.dailyHigh,
        dailyLow: quote?.dailyLow,
        weekUp: quote?.weekUp,
        marketCap: quote?.price
          ? multiply(quote.price, rwa.stockStatistics.totalShare || 0)
          : undefined,
        floatCap: quote?.price
          ? multiply(quote.price, rwa.stockStatistics.circShare || 0)
          : undefined,
      }
    })

  useEffect(() => {
    const listener = (data: ISummaryData) => {
      const obj = data.reduce(
        (acc, item) => {
          acc[symbolToLower(item.S)] = {
            price: truncate(item.p, 2),
            // item.p 最新价 itme.pc 昨日收盘价
            // up = (最新价 - 昨日收盘价) - 1
            up:
              item.p && item.pc
                ? truncate(multiply(subtract(divide(item.p, item.pc), 1), 100), 2)
                : '0',
            dailyHigh: item.h ? truncate(item.h, 2) : '0',
            dailyLow: item.l ? truncate(item.l, 2) : '0',
            // 周涨跌幅
            // weekUp = (item.p 最新价 - item.wc 上周收盘价) - 1
            weekUp:
              item.p && item.wc
                ? truncate(multiply(subtract(divide(item.p, item.wc), 1), 100), 2)
                : '0',
          }
          return acc
        },
        {} as Record<string, IQuote>
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

  const { paginatedData, totalPage, currentPage, onPrevClick, onNextClick } =
    usePaginationData<IMarketQuote>(20, MarketQuotesListConfig, marketQuotes, sort)

  return (
    <MainLayout>
      <ConentLayout>
        <div>
          <MarketTrading align='center' />
          <SearchFilter
            searchText={searchText}
            onSearchChange={setSearchText}
            isFavorites={isFavorites}
            onFavoriteChange={setIsFavorites}
          />
          <TableHeader<
            SortableField,
            IMarketQuote,
            { toggleFavorite: (stockId: number) => Promise<boolean>; toggleEnable: boolean }
          >
            lngPrefix='marketQuotes'
            config={MarketQuotesListConfig}
            sort={sort}
            className='px-6'
            onSortChange={onSortChange}
            thClassName={'text-xs/[15px] text-gray-400 font-normal'}
          />
          {paginatedData.length === 0 && (
            <NoDataReason isFavorites={isFavorites} {...favoritesRest} />
          )}
          <TableBody<
            IMarketQuote,
            { toggleFavorite: (stockId: number) => void; toggleEnable: boolean }
          >
            data={paginatedData}
            config={MarketQuotesListConfig}
            extra={{
              toggleFavorite: favoritesRest.toggleFavorite,
              toggleEnable: favoritesRest.toggleEnable,
            }}
            getKey={(item: IMarketQuote) => item.symbol}
            className='px-6 cursor-pointer hover:bg-white/4'
            onClick={(item: IMarketQuote) => {
              updateInputToken(item)
              router.push('/markets/trading/' + symbolToLower(item.symbol))
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

function NoDataReason(props: {
  isFavorites: boolean
  account?: string
  chainId: number | null
  isSignatureValid: boolean
  isWalletConnecting: boolean
  refreshIsSignatureValid: () => void
}) {
  if (!props.isFavorites) {
    return <NoRecord />
  }
  if (!props.account && props.isWalletConnecting) return null
  if (!props.account) return <WalletNotConnectedSmallVersion />
  if (!props.isSignatureValid)
    return (
      <SignatureVerify
        desc='signatureVerifyDescTop'
        subDesc='signatureVerifyDescBottom'
        className='mt-9'
        refreshIsSignatureValid={props.refreshIsSignatureValid}
      />
    )
  return <NoRecord />
}

function QuoteName(props: {
  isFavorite: boolean
  toggleEnable: boolean
  toggleFavorite: (stockId: number) => void
  logo: string
  symbol: string
  name: string
  stockId: number
}) {
  return (
    <>
      <LazyImage
        onClick={ev => {
          ev.stopPropagation()
          if (!props.toggleEnable) return
          props.toggleFavorite(props.stockId)
        }}
        src={props.isFavorite ? '/images/v2/icons/collected.png' : '/images/v2/icons/collect.png'}
        className={cn('w-4 h-4 mr-3', props.toggleEnable ? 'cursor-pointer' : 'cursor-not-allowed')}
      />
      <LazyImage src={props.logo} className='w-12 h-12 mr-2 rounded-[50%]' />
      <div className='flex flex-col'>
        <TextCell text={props.symbol} className='text-base/5 text-white font-normal' />
        <TextCell text={props.name} className='text-xs/[15px] text-gray-400 font-normal' />
      </div>
    </>
  )
}

function TextCell(props: { text: string; className?: string; icon?: string }) {
  return (
    <div className={cn('flex flex-row gap-1 items-center', props.className)}>
      {props.icon && <LazyImage className='w-2 h-2' src={props.icon} />}
      <span>{props.text}</span>
    </div>
  )
}

function getColorAndIcon(change: Change) {
  switch (change) {
    case 0:
      return { color: 'text-gray-400', icon: '' }
    case 1:
      return { color: 'text-green-50', icon: '/images/convert/price_up.png' }
    case -1:
      return { color: 'text-red-50', icon: '/images/convert/price_down.png' }
    default:
      return { color: 'text-gray-400', icon: '' }
  }
}

function TextCellWithColor(props: { text: string; change: Change; withIcon: boolean }) {
  const { icon, color } = getColorAndIcon(props.change)

  return (
    <TextCell
      className={cn('text-sm/4.5 font-normal', color)}
      text={props.text}
      icon={props.withIcon ? icon : ''}
    />
  )
}
const MarketQuotesListConfig = [
  {
    key: 'name',
    sortable: true,
    width: 246,
    render: (
      item: IMarketQuote,
      extra: { toggleFavorite: (stockId: number) => void; toggleEnable: boolean }
    ) => (
      <>
        <QuoteName
          isFavorite={item.isFavorite}
          toggleEnable={extra.toggleEnable}
          toggleFavorite={extra.toggleFavorite}
          logo={item.icon || ''}
          stockId={item.stockId}
          symbol={item.symbol}
          name={item.name}
        />
        {item.state === 1 && (
          <IconWithTooltip
            triggerClassName='ml-2'
            icon='/images/v2/icons/trade_halt.svg'
            tooltip={'marketQuotes.tH'}
          />
        )}
      </>
    ),
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.name, b.name, order),
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
    render: (item: IMarketQuote) => (
      <TextCellWithColor
        text={item.price ? textPrefix(toFixed(item.price, item.precision), '$') : '--'}
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
    render: (item: IMarketQuote) => {
      const change = strOrNumToSign(item.up ?? 0)
      return (
        <TextCellWithColor
          text={item.up ? textPrefix(textSuffix(item.up, '%', 0), change === 1 ? '+' : '') : '--'}
          change={change}
          withIcon={false}
        />
      )
    },
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) => advancedSort(a.up, b.up, order),
  },
  {
    key: 'weekChange',
    sortable: true,
    render: (item: IMarketQuote) => {
      const change = strOrNumToSign(item.weekUp ?? 0)
      return (
        <TextCellWithColor
          text={
            item.weekUp
              ? textPrefix(textSuffix(item.weekUp, '%', 0), change === 1 ? '+' : '')
              : '--'
          }
          change={change}
          withIcon={false}
        />
      )
    },
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      advancedSort(a.weekUp, b.weekUp, order),
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
  {
    key: 'dailyHigh',
    sortable: false,
    render: (item: IMarketQuote) => (
      <TextCell
        className='text-sm/4.5 font-normal'
        text={item.dailyHigh ? textPrefix(toFixed(item.dailyHigh), '$') : '--'}
      />
    ),
  },
  {
    key: 'dailyLow',
    sortable: false,
    render: (item: IMarketQuote) => (
      <TextCell
        className='text-sm/4.5 font-normal'
        text={item.dailyLow ? textPrefix(toFixed(item.dailyLow), '$') : '--'}
      />
    ),
  },
  // {
  //   key: 'quickBuy',
  //   sortable: false,
  //   render: (item: IMarketQuote) => <RwaStateButton rwa={item} className='text-base/[19px]' />,
  // },
]
