import type { ITokenExchanged, ITokenExchangedFilter } from '@/service/scan/types'
import { OrderTable } from '@/views/assets/v2/shared'
import { scanApi } from '@/service/scan/api'
import { type ITableConfig } from '@/components/table-header'
import { TokenCell, TextCellWithTranslation, TextCell, TxHashCell } from '@/views/assets/Shared'
import { type IRwa } from '@/service/base/types'
import {
  cn,
  formatTimestamp,
  truncate,
  checkAddressEqual,
  isGreater,
  isLess,
  isEqual,
} from '@/utils'
import BigNumber from 'bignumber.js'

function calcFractionalShares(
  payinAmount: number | string | bigint,
  payinShares: number | string | bigint,
  payoutShares: number | string | bigint
): string {
  const amount = new BigNumber(payinAmount ?? 0)
  const fromShares = new BigNumber(payinShares ?? 0)
  const toShares = new BigNumber(payoutShares ?? 0)

  if (!amount.isFinite() || !fromShares.isFinite() || !toShares.isFinite()) return '--'
  if (amount.lte(0) || fromShares.lte(0) || toShares.lte(0)) return '--'

  const totalShares = amount.multipliedBy(toShares).dividedBy(fromShares)
  const fractionalShares = totalShares.minus(totalShares.integerValue(BigNumber.ROUND_DOWN))

  return (
    fractionalShares
      .decimalPlaces(6, BigNumber.ROUND_DOWN)
      .toFixed()
      .replace(/\.?0+$/, '') || '0'
  )
}

function amountToDisplay(amount: number | string): string {
  if (isEqual(amount, '0')) return '0'
  if (isGreater(amount, '0') && isLess(amount, '0.01')) return '<0.01'
  return truncate(amount, 2)
}

const PAGE_LIMIT = 20
const EMPTY_FILTER = {}

export function ExchangeHistoryTable(props: {
  chainId: number | null
  account: string | undefined
}) {
  return (
    <OrderTable<ITokenExchanged, ITokenExchangedFilter>
      chainId={props.chainId}
      account={props.account}
      PAGE_LIMIT={PAGE_LIMIT}
      dataMode={'pagination'}
      api={scanApi.getTokenExchangedList}
      scrollId={(item: ITokenExchanged) => item.id}
      filter={EMPTY_FILTER}
      tableConfig={exchangeTableConfig}
      type={'tokenExchanged'}
      lngPrefix='events'
      signatureSubTitle='rebate.sigSubTitle'
      scrollToTopWhenPagination={false}
      paginationClassName='justify-center px-4 pt-2 pb-4'
    />
  )
}

const exchangeTableConfig: ITableConfig<ITokenExchanged, { rwaTokens: IRwa[] }> = [
  {
    key: 't35',
    sortable: false,
    width: 150,
    render: (item: ITokenExchanged, { rwaTokens }) => {
      const rwa = rwaTokens.find(token => token.address === item.payinToken)
      if (!rwa) return '--'
      return (
        <TokenCell
          token={rwa.symbol}
          name={rwa.name}
          icon={rwa.icon}
          iconClassName={cn('w-7 h-7')}
          tokenClassName='font-medium'
        />
      )
    },
  },
  {
    key: 't19',
    sortable: false,
    width: 100,
    render: (item: ITokenExchanged) => {
      const type = item.type === 1 ? 'events.t17' : 'events.t18'
      return <TextCellWithTranslation className='text-sm/4.5' text={type} />
    },
  },
  {
    key: 't10',
    sortable: false,
    width: 70,
    render: (item: ITokenExchanged) => <TextCell className='text-sm/4.5' text={item.rate} />,
  },
  {
    key: 't36',
    sortable: false,
    width: 125,
    render: (item: ITokenExchanged) => (
      <TextCell className='text-sm/4.5 w-[80px]' text={formatTimestamp(item.txTime)} />
    ),
  },
  {
    key: 't37',
    sortable: false,
    width: 110,
    render: (item: ITokenExchanged) => (
      <TextCell className='text-sm/4.5' text={truncate(item.price, 2)} />
    ),
  },
  {
    key: 't29',
    sortable: false,
    render: (item: ITokenExchanged, { rwaTokens }) => {
      const rwa = rwaTokens.find(token => checkAddressEqual(token.address, item.payinToken))
      if (!rwa) return '--'
      const text = `-${item.payinAmount} ${rwa.symbol}`
      return <TextCell className='text-sm/4.5' text={text} />
    },
  },
  {
    key: 't30',
    sortable: false,
    render: (item: ITokenExchanged, { rwaTokens }) => {
      console.log(
        'rwaTokens',
        rwaTokens.filter(item => item.stockId === 17)
      )
      const rwa = rwaTokens.find(token => checkAddressEqual(token.address, item.payoutToken))
      if (!rwa) return <TextCell className='text-sm/4.5' text='--none--' />
      const text = `+${item.payoutAmount} ${rwa.symbol}`
      return <TextCell className='text-sm/4.5' text={text} />
    },
  },
  {
    key: 't26',
    sortable: false,
    render: (item: ITokenExchanged, { rwaTokens }) => {
      const rwa = rwaTokens.find(token => checkAddressEqual(token.address, item.payoutToken))
      if (!rwa) return '--'
      const [payinShares = '0', payoutShares = '0'] = String(item.rate ?? '').split(':')
      const fractionalShares = calcFractionalShares(item.payinAmount, payinShares, payoutShares)
      const payoutText = `+${amountToDisplay(item.paymentAmount)} ${item.paymentToken}`
      const fractionalText = `${amountToDisplay(fractionalShares)} ${rwa.symbol}`
      return (
        <div className='flex flex-col gap-[2px]'>
          <TextCell className='text-sm/4.5' text={payoutText} />
          <div className='flex flex-row gap-1'>
            <TextCellWithTranslation className='text-gray-500' text='events.t27' />
            <TextCell className='text-gray-500' text={fractionalText} />
          </div>
        </div>
      )
    },
  },
  {
    key: 'tx',
    width: 118,
    sortable: false,
    render: (item: ITokenExchanged) => <TxHashCell hash={item.txHash} />,
  },
]
