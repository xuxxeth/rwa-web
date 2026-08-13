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
import IconWithTooltip, { NumberWithTooltip, TooltipWithBorder } from '@/components/icon-tooltip'
import { Trans } from 'react-i18next'
import { ClaimButton } from '@/components/button/ClaimButton'


const PAGE_LIMIT = 10
const EMPTY_FILTER = {}

export function AllRecordTable(props: {
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
    key: 't56',
    sortable: false,
    width: 192,
    render: (item: ITokenExchanged, { rwaTokens }) => {
      const rwa = rwaTokens.find(token => token.address === item.payinToken)
      if (!rwa) return '--'
      return (
        <div className='flex flex-row'>
          <TokenCell
            token={rwa.symbol}
            name={rwa.name}
            icon={rwa.icon}
            iconClassName={cn('w-7 h-7')}
            tokenClassName='font-medium'
            tokenExtraTag={
              item.riskType === 1 ? (
                <IconWithTooltip
                  icon={'/images/v2/events/info.svg'}
                  iconOrTextClassName={cn('w-3 h-3 self-start')}
                  tooltip={
                    <div className='text-xs/4 text-gray-300 font-normal'>
                      <Trans
                        i18nKey='events.t46'
                        values={{ email: 'contact@tiko.cc' }}
                        components={[<a key='0' href='mailto:contact@tiko.cc' />]}
                      />
                    </div>
                  }
                />
              ) : null
            }
          />
        </div>
      )
    },
  },
  {
    key: 't57',
    sortable: false,
    width: 192,
    render: (item: ITokenExchanged) => {
      const type = item.type === 1 ? 'events.t17' : 'events.t18'
      return <TextCellWithTranslation className='text-sm/4.5' text={type} />
    },
  },
  {
    key: 't58',
    sortable: false,
    width: 192,
    render: (item: ITokenExchanged) => <TextCell className='text-sm/4.5' text={item.rate} />,
  },
  {
    key: 't59',
    sortable: false,
    width: 192,
    render: (item: ITokenExchanged) => (
      <TextCell className='text-sm/4.5 w-[80px]' text={formatTimestamp(item.txTime)} />
    ),
  },
  {
    key: 't60',
    sortable: false,
    width: 192,
    render: (item: ITokenExchanged) => (
      <TextCell className='text-sm/4.5' text={truncate(item.price, 2)} />
    ),
  },
  {
    key: 't61',
    sortable: false,
    render: (item: ITokenExchanged, { rwaTokens }) => {
      const rwa = rwaTokens.find(token => checkAddressEqual(token.address, item.payinToken))
      if (!rwa) return '--'
      const text = `-${item.payinAmount} ${rwa.symbol}`
      return <TextCell className='text-sm/4.5' text={text} />
    },
  },
  {
    key: 't62',
    sortable: false,
    className: "justify-end",
    headerDirection: 'end',
    render: (item: ITokenExchanged) => {
      return  <ClaimButton />
    },
  },
  
]
