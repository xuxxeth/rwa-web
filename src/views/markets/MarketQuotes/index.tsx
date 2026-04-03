import { MainLayout } from '@/layouts/main'
import ConentLayout from '@/layouts/content'
import { useTranslation } from '@/hooks/useTranslation'
import { LazyImage } from '@/components/image/LazyImage'
import { type Order, useTableSort, usePaginationData } from '@/hooks/useTableHelper'
import {
  cn,
  advancedSort,
  textPrefix,
  strOrNumToSign,
  type Change,
  symbolToLower,
  multiply,
  formatLargeNumber,
  fuzzySearch,
  formatUp,
  calculateUp,
} from '@/utils'
import TooltipWithIcon from '@/components/icon-tooltip'
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
import NoRecord from '@/components/no-record'
import useFavorites from '@/hooks/useFavorites'
import { WalletNotConnectedSmallVersion } from '@/components/wallet-not-connected'
import SignatureVerify from '@/components/signature-verify'
import type { IRwa } from '@/service/base/types'
import { PreMarketOpen } from '@/components/markets/PreMarketOpen'
import { useBaseStore } from '@/stores/baseStore'
import { MARKET_STATUS } from '@/config/constants'

type SortableField = 'name' | 'token' | 'price' | 'change' | 'marketCap' | 'dailyHigh'

export function useRwaListWithQuote(rwaList: IRwa[], marketTradeState: number) {
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
        marketTradeState,
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
            // 盘中价格
            close: item.c,
            // 盘中收盘价涨跌幅
            closeUp: item.c && item.pc ? calculateUp(item.c, item.pc) : undefined,
            // 最新价格涨跌幅
            up: item.p && item.c ? calculateUp(item.p, item.c) : undefined,
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

export default function MarketQuotes() {
  const { t } = useTranslation()
  const { sort, onSortChange } = useTableSort<SortableField>()
  const router = useRouter()

  const rwaList = useRwaTokens(false)
  const marketTradeState = useBaseStore(state => state.marketTradeState)

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

  const marketQuotes = useRwaListWithQuote(newRwaList, marketTradeState)

  const { paginatedData, totalPage, currentPage, setPage, onPrevClick, onNextClick } =
    usePaginationData<IMarketQuote>(20, MarketQuotesListConfig, marketQuotes, sort)

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
                onFavoriteChange={setIsFavorites}
              />
            </div>
            <div>
              <PreMarketOpen />
            </div>
          </div>

          <TableHeader<
            SortableField,
            IMarketQuote,
            {
              toggleFavorite: (stockId: number) => Promise<boolean>
              toggleEnable: boolean
              isFavorite: (stockId: number) => boolean
            }
          >
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
          <TableBody<
            IMarketQuote,
            {
              toggleFavorite: (stockId: number) => void
              toggleEnable: boolean
              isFavorite: (stockId: number) => boolean
            }
          >
            data={paginatedData}
            config={MarketQuotesListConfig}
            extra={{
              toggleFavorite: favoritesRest.toggleFavorite,
              toggleEnable: favoritesRest.toggleEnable,
              isFavorite,
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
      <div className='flex flex-col overflow-hidden'>
        <TextCell text={props.symbol} className='text-base/5 text-white font-normal' />
        <TooltipWithIcon tooltip={props.name} triggerClassName='justify-start'>
          <span className='text-xs/[15px] text-gray-400 font-normal truncate'>{props.name}</span>
        </TooltipWithIcon>
      </div>
    </>
  )
}

function TextCell(props: {
  text: string
  className?: string
  icon?: string
  textClassName?: string
}) {
  return (
    <div className={cn('flex flex-row gap-1 items-center', props.className)}>
      {props.icon && <LazyImage className='w-2 h-2' src={props.icon} />}
      <span className={cn(props.textClassName)}>{props.text}</span>
    </div>
  )
}

function MarketTradeStateTag({ marketTradeState }: { marketTradeState: number }) {
  const { t } = useTranslation()
  let text = undefined
  if (marketTradeState === MARKET_STATUS.CLOSE || marketTradeState === MARKET_STATUS.AFTER) {
    text = t('v3.t13')
  }
  if (marketTradeState === MARKET_STATUS.BEFORE) {
    text = t('v3.t11')
  }
  if (!text) return null
  return (
    <span className='text-xs/[15px] rounded-[2px] text-gray-400 font-normal bg-opacity-03 px-1 py-[2px]'>
      {text}
    </span>
  )
}

export function getColorAndIcon(change: Change) {
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
      extra: {
        toggleFavorite: (stockId: number) => void
        toggleEnable: boolean
        isFavorite: (stockId: number) => boolean
      }
    ) => (
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
        {item.state === 1 && (
          <IconWithTooltip
            triggerClassName='ml-2 shrink-0'
            icon='/images/v2/icons/trade_halt.svg'
            tooltip={'marketQuotes.tH'}
          />
        )}
      </div>
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
    render: (item: IMarketQuote) => {
      const priceAndUpToShowList =
        item.marketTradeState === MARKET_STATUS.OPEN
          ? [
              {
                price: item.price,
                up: item.up,
              },
            ]
          : [
              {
                price: item.close,
                up: item.closeUp,
              },
              {
                price: item.price,
                up: item.up,
              },
            ]
      return (
        <div className='flex flex-col gap-1'>
          {priceAndUpToShowList[0] && (
            <TextCellWithColor
              text={
                priceAndUpToShowList[0].price
                  ? textPrefix(truncate(priceAndUpToShowList[0].price, item.precision), '$')
                  : '--'
              }
              change={strOrNumToSign(priceAndUpToShowList[0].up ?? '0')}
              withIcon={false}
            />
          )}
          {priceAndUpToShowList[1] && (
            <div className='flex flex-row items-center gap-1'>
              <TextCell
                className='text-xs/[15px] font-normal text-gray-400'
                text={
                  priceAndUpToShowList[1].price
                    ? textPrefix(truncate(priceAndUpToShowList[1].price, item.precision), '$')
                    : '--'
                }
              />
              <MarketTradeStateTag marketTradeState={item.marketTradeState} />
            </div>
          )}
        </div>
      )
    },
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      a.marketTradeState === MARKET_STATUS.OPEN
        ? advancedSort(a.price, b.price, order)
        : advancedSort(a.close, b.close, order),
  },
  {
    key: 'change',
    sortable: true,
    render: (item: IMarketQuote) => {
      const upList =
        item.marketTradeState === MARKET_STATUS.OPEN
          ? [{ up: item.up }]
          : [{ up: item.closeUp }, { up: item.up }]
      return (
        <div className='flex flex-col gap-1'>
          {upList[0] && (
            <TextCellWithColor
              text={upList[0].up !== undefined ? formatUp(upList[0].up) : '--'}
              change={strOrNumToSign(upList[0].up ?? 0)}
              withIcon={false}
            />
          )}
          {upList[1] && (
            <div className='flex flex-row items-center gap-1'>
              <TextCell
                className='text-xs/[15px] font-normal text-gray-400'
                text={upList[1].up !== undefined ? formatUp(upList[1].up) : '--'}
              />
              <MarketTradeStateTag marketTradeState={item.marketTradeState} />
            </div>
          )}
        </div>
      )
    },
    sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
      a.marketTradeState === MARKET_STATUS.OPEN
        ? advancedSort(a.up, b.up, order)
        : advancedSort(a.closeUp, b.closeUp, order),
  },
  // {
  //   key: 'weekChange',
  //   sortable: true,
  //   render: (item: IMarketQuote) => {
  //     const change = strOrNumToSign(item.weekUp ?? 0)
  //     return (
  //       <TextCellWithColor
  //         text={
  //           item.weekUp
  //             ? textPrefix(textSuffix(item.weekUp, '%', 0), change === 1 ? '+' : '')
  //             : '--'
  //         }
  //         change={change}
  //         withIcon={false}
  //       />
  //     )
  //   },
  //   sorter: (a: IMarketQuote, b: IMarketQuote) => (order: Order) =>
  //     advancedSort(a.weekUp, b.weekUp, order),
  // },
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
  // {
  //   key: 'quickBuy',
  //   sortable: false,
  //   render: (item: IMarketQuote) => <RwaStateButton rwa={item} className='text-base/[19px]' />,
  // },
]
