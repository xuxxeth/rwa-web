import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { OrderTable } from '@/views/assets/v2/shared'
import { TextCell, TxHashCell, AddressCell } from '@/views/assets/Shared'
import type { IRebate, IRebateFilter, IClaim } from '@/service/scan/types'
import { scanApi } from '@/service/scan/api'
import { referralApi } from '@/service/referral/api'
import { type IInvitee } from '@/service/referral/types'
import { type ITableConfig } from '@/components/table-header'
import { useAccount, useChainId } from 'ca-common-web'
import IconWithTooltip from '@/components/icon-tooltip'
import { formatTimestamp, multiply, textSuffix, isLess, truncate, sum } from '@/utils'
import { AmountDisplay, TokenCell } from './RebateStats'

type TabType = 'invite' | 'rebate' | 'withdraw'

const TABS: Array<{ key: TabType; label: string }> = [
  { key: 'invite', label: 'referralHis' },
  { key: 'rebate', label: 'rebateHis' },
  { key: 'withdraw', label: 'claimHis' },
]

interface TabButtonProps {
  label: string
  active: boolean
  onClick: () => void
  t: (key: string) => string
}

function TabButton({ label, active, onClick, t }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-[8px] cursor-pointer py-[4px] rounded-[6px] transition-colors ${
        active ? 'bg-[#282a2f] text-white' : 'text-[#9da3af]'
      }`}
    >
      <p className='font-normal text-[18px] leading-normal whitespace-nowrap'>
        {t(`rebate.${label}`)}
      </p>
    </button>
  )
}

export default function RecordsSection() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>('invite')
  const account = useAccount()
  const chainId = useChainId()

  return (
    <div className='min-h-[480px] rounded-[16px] border border-[#232427] w-full'>
      <div className='flex flex-col gap-[16px] px-[32px] py-[24px] h-full'>
        <div className='flex gap-[16px] items-center p-[8px] rounded-[8px] border border-[#232427]'>
          {TABS.map(tab => (
            <TabButton
              key={tab.key}
              label={tab.label}
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              t={t}
            />
          ))}
        </div>
        <div>
          {activeTab === 'invite' && <InviteeHistoryTable chainId={chainId} account={account} />}
          {activeTab === 'rebate' && <RebateHistoryTable chainId={chainId} account={account} />}
          {activeTab === 'withdraw' && <WithdrawHistoryTable chainId={chainId} account={account} />}
        </div>
      </div>
    </div>
  )
}

const PAGE_LIMIT = 10
const EMPTY_FILTER = {}

function InviteeHistoryTable(props: { chainId: number | null; account: string | undefined }) {
  return (
    <OrderTable<IInvitee, IRebateFilter>
      chainId={props.chainId}
      account={props.account}
      PAGE_LIMIT={PAGE_LIMIT}
      dataMode={'pagination'}
      signatureSubTitle='rebate.sigSubTitle'
      api={referralApi.getInvitees}
      scrollId={(item: IInvitee) => item.id}
      filter={EMPTY_FILTER}
      tableConfig={inviteeTableConfig}
      type={'invitee'}
      lngPrefix='rebate'
      scrollToTopWhenPagination={false}
      paginationClassName='justify-end px-4 pt-2 pb-4'
    />
  )
}

const inviteeTableConfig: ITableConfig<IInvitee, {}> = [
  {
    key: 'inviteTime',
    sortable: false,
    render: (item: IInvitee) => (
      <TextCell className='text-xs/4' text={formatTimestamp(item.createTime / 1000)} />
    ),
  },
  {
    key: 'inviteeAddr',
    sortable: false,
    render: (item: IInvitee) => <AddressCell address={item.referee} />,
  },
  {
    key: 'ratio',
    sortable: false,
    render: (item: IInvitee) => (
      <TextCell className='text-xs/4' text={textSuffix(item.ratio.toString(), '%', 0)} />
    ),
  },
  {
    key: 'totalContributed',
    width: 180,
    sortable: false,
    render: (item: IInvitee) => (
      <div className='font-normal text-white text-xs/4'>
        <AmountDisplay amount={item.contribute} />
        <span className='ml-1'>USD</span>
      </div>
    ),
  },
]

function WithdrawHistoryTable(props: { chainId: number | null; account: string | undefined }) {
  return (
    <OrderTable<IClaim, IRebateFilter>
      chainId={props.chainId}
      account={props.account}
      PAGE_LIMIT={PAGE_LIMIT}
      dataMode={'pagination'}
      api={scanApi.getClaims}
      scrollId={(item: IClaim) => item.id}
      filter={EMPTY_FILTER}
      tableConfig={claimTableConfig}
      type={'claim'}
      lngPrefix='rebate'
      signatureSubTitle='rebate.sigSubTitle'
      scrollToTopWhenPagination={false}
      paginationClassName='justify-end px-4 pt-2 pb-4'
    />
  )
}

const claimTableConfig: ITableConfig<IClaim, {}> = [
  {
    key: 'claimTime',
    sortable: false,
    render: (item: IClaim) => (
      <TextCell className='text-xs/4' text={formatTimestamp(item.claimTime)} />
    ),
  },
  {
    key: 'claimAmount',
    sortable: false,
    render: (item: IClaim) => {
      try {
        const data = JSON.parse(item.data) as { [token: string]: number }
        const total = sum(...Object.values(data))

        return (
          <IconWithTooltip
            tooltip={
              <div>
                {Object.entries(data)
                  .sort((a: [string, number], b: [string, number]) => {
                    return a[0] > b[0] ? -1 : 1
                  })
                  .map(([token, amount]) => (
                    <div key={token} className='flex flex-row text-white items-center gap-1'>
                      <AmountDisplay amount={amount} showTooltip={false} />
                      <TokenCell token={token} className='ml-auto w-8' />
                    </div>
                  ))}
              </div>
            }
          >
            <div className='font-normal flex flex-row items-center  text-white text-xs/4 border-b border-dashed cursor-pointer'>
              <AmountDisplay amount={total} showTooltip={false} />
              <span className='ml-1'>USD</span>
            </div>
          </IconWithTooltip>
        )
      } catch (error) {
        return <TextCell className='text-xs/4' text={textSuffix('--', 'USD')} />
      }
    },
  },
  {
    key: 'tx',
    width: 140,
    sortable: false,
    render: (item: IClaim) => <TxHashCell hash={item.txHash} />,
  },
]

function RebateHistoryTable(props: { chainId: number | null; account: string | undefined }) {
  return (
    <OrderTable<IRebate, IRebateFilter>
      chainId={props.chainId}
      account={props.account}
      PAGE_LIMIT={PAGE_LIMIT}
      dataMode={'pagination'}
      api={scanApi.getRebates}
      scrollId={(item: IRebate) => item.id}
      filter={EMPTY_FILTER}
      tableConfig={rebateTableConfig}
      type={'rebate'}
      lngPrefix='rebate'
      signatureSubTitle='rebate.sigSubTitle'
      scrollToTopWhenPagination={false}
      paginationClassName='justify-end px-4 pt-2 pb-4'
    />
  )
}

const rebateTableConfig: ITableConfig<IRebate, {}> = [
  {
    key: 'rebateTime',
    sortable: false,
    render: (item: IRebate) => (
      <TextCell className='text-xs/4' text={formatTimestamp(item.rebateTime)} />
    ),
  },
  {
    key: 'inviteeAddr',
    sortable: false,
    render: (item: IRebate) => <AddressCell address={item.referee} />,
  },
  {
    key: 'ratio',
    sortable: false,
    render: (item: IRebate) => <TextCell text={textSuffix(multiply(item.ratio, 100), '%', 0)} />,
  },
  {
    key: 'amount',
    sortable: false,
    render: (item: IRebate) => {
      return (
        <div className='font-normal text-white text-xs/4'>
          <AmountDisplay amount={item.amount} />
          <span className='ml-1'>{item.token}</span>
        </div>
      )
    },
  },
  {
    key: 'tx',
    width: 140,
    sortable: false,
    render: (item: IRebate) => <TxHashCell hash={item.txHash} />,
  },
]
