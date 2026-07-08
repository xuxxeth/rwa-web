import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { OrderTable } from '@/views/assets/v2/shared'
import { TextCell, TxHashCell, AddressCell } from '@/views/assets/Shared'
import type { IRebate, IRebateFilter, IClaim } from '@/service/scan/types'
import { scanApi } from '@/service/scan/api'
import { type ITableConfig } from '@/components/table-header'
import { useAccount, useChainId } from 'ca-common-web'
import { formatTimestamp, multiply, textSuffix,  sum } from '@/utils'
import { TabNav, type TabKey } from './TabNav'
import { EventCard, type EventData } from './EventCard'




export default function RecordsSection() {
  
  const EVENTS: EventData[] = [
    // Row 1 — active (进行中)
    { symbol: "APPLt", company: "Apple Inc", isHeld: true,  eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "active" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "active" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "active" },
    // Row 2 — ended (已结束)
    { symbol: "APPLt", company: "Apple Inc", isHeld: true,  eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "ended" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "ended" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "ended" },
    // Row 3 — suspended (暂停中)
    { symbol: "APPLt", company: "Apple Inc", isHeld: true,  eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "suspended" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "suspended" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "suspended" },
    // Row 4 — pending (未开始)
    { symbol: "APPLt", company: "Apple Inc", isHeld: true,  eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "pending" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "pending" },
    { symbol: "APPLt", company: "Apple Inc", isHeld: false, eventType: "合股", ratio: "10:1", startTime: "2026/06/12 10:00", endTime: "2026/06/15 10:00", status: "pending" },
    ];
  const { t } = useTranslation()
  const account = useAccount()
  const chainId = useChainId()
  const [activeTab, setActiveTab] = useState<TabKey>("held");
  const [page, setPage] = useState(1);

  const visibleEvents = activeTab === "held"
    ? EVENTS.filter((e) => e.isHeld)
    : EVENTS;

  return (
    <div className='min-h-[680px] rounded-[16px] w-full'>
      <div className='flex flex-col gap-[16px] h-full'>
          {/* Tabs */}
        <TabNav active={activeTab} onChange={(t) => { setActiveTab(t); setPage(1); }} />
        <div>
          {
            (activeTab === 'held' || activeTab === 'all') && (
              <>
                <div className="grid grid-cols-3 gap-5 mt-6">
                  {visibleEvents.map((event, i) => (
                    <EventCard key={i} data={event} />
                  ))}
                </div>
                {/* Note */}
                <p className="text-[#737a87] text-[14px] flex items-start gap-2 mt-5">
                  <span className="text-[#ffb219] mt-px">⚠</span>
                  {t("events.t24")}
                </p>
              </>
              
            )
          }
          {activeTab === 'history' && <ExchangeHistoryTable chainId={chainId} account={account} />}
        </div>
      </div>
    </div>
  )
}

const PAGE_LIMIT = 10
const EMPTY_FILTER = {}


function ExchangeHistoryTable(props: { chainId: number | null; account: string | undefined }) {
  return (
    <OrderTable<IClaim, IRebateFilter>
      chainId={props.chainId}
      account={props.account}
      PAGE_LIMIT={PAGE_LIMIT}
      dataMode={'pagination'}
      api={scanApi.getClaims}
      scrollId={(item: IClaim) => item.id}
      filter={EMPTY_FILTER}
      tableConfig={exchangeTableConfig}
      type={'claim'}
      lngPrefix='events'
      signatureSubTitle='rebate.sigSubTitle'
      scrollToTopWhenPagination={false}
      paginationClassName='justify-end px-4 pt-2 pb-4'
    />
  )
}

const exchangeTableConfig: ITableConfig<IClaim, {}> = [
  {
    key: 't35',
    sortable: false,
    render: (item: IClaim) => (
      <TextCell className='text-xs/4' text={formatTimestamp(item.claimTime)} />
    ),
  },
  {
    key: 't19',
    sortable: false,
    render: (item: IClaim) => (
      <TextCell className='text-xs/4' text={formatTimestamp(item.claimTime)} />
    ),
  },
  {
    key: 't10',
    sortable: false,
    render: (item: IClaim) => (
      <TextCell className='text-xs/4' text={formatTimestamp(item.claimTime)} />
    ),
  },
  {
    key: 't36',
    sortable: false,
    render: (item: IClaim) => (
      <TextCell className='text-xs/4' text={formatTimestamp(item.claimTime)} />
    ),
  },
  {
    key: 't11',
    sortable: false,
    render: (item: IClaim) => (
      <TextCell className='text-xs/4' text={formatTimestamp(item.claimTime)} />
    ),
  },
  {
    key: 't37',
    sortable: false,
    render: (item: IClaim) => (
      <TextCell className='text-xs/4' text={formatTimestamp(item.claimTime)} />
    ),
  },
  {
    key: 't29',
    sortable: false,
    render: (item: IClaim) => (
      <TextCell className='text-xs/4' text={formatTimestamp(item.claimTime)} />
    ),
  },
  {
    key: 't30',
    sortable: false,
    render: (item: IClaim) => (
      <TextCell className='text-xs/4' text={formatTimestamp(item.claimTime)} />
    ),
  },
  {
    key: 't26',
    sortable: false,
    render: (item: IClaim) => (
      <TextCell className='text-xs/4' text={formatTimestamp(item.claimTime)} />
    ),
  },
  {
    key: 'tx',
    width: 140,
    sortable: false,
    render: (item: IClaim) => <TxHashCell hash={item.txHash} />,
  },
]

