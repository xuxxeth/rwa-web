import { useState, type ReactNode, type RefObject } from 'react'
import { LazyImage } from '@/components/image/LazyImage'
import { cn, shortenAddress } from '@/utils'
import { useTranslation } from '@/hooks/useTranslation'
import CopyButton from '@/components/button/copyButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import VectorSVG from '@/components/pagination/vector.svg?react'
import { CheckBoxBySVG } from '@/components/check-box'
import { textSuffix, toFixed, sum } from '@/utils'
import type { IOrder, OrderType, RiskType } from '@/service/scan/types'
import BigNumber from 'bignumber.js'
import IconWithTooltip from '@/components/icon-tooltip'
import NoRecord, { NoRecordAndSeeMore } from '@/components/no-record'
import { useNavigate } from 'react-router-dom'

export type OrderChanged = {
  orderId: string
  eventTime: number
  status: string
}
export type OrderChangedStatus =
  | 'NEW'
  | 'FILLED'
  | 'PENDING_CANCEL'
  | 'CANCELLED'
  | 'PARTIALLY_FILLED'
  | 'FAILED'

export function checkOrderChangedEqual(a: OrderChanged | null, b: OrderChanged | null) {
  if (a === null || b === null) return false
  return a.orderId === b.orderId && a.eventTime === b.eventTime && a.status === b.status
}

export function TextCell(props: { text: string | number; className?: string }) {
  return <div className={cn('text-xs/4 font-normal', props.className)}>{props.text}</div>
}

export function TradingFees(props: { currency: string; commission: string; fee: string }) {
  let { currency, commission, fee } = props
  commission = toFixed(commission)
  fee = toFixed(fee)

  const sumFees = sum(commission, fee)
  const { t } = useTranslation()
  const tooltip = (
    <div className='flex flex-col gap-1'>
      {[
        {
          title: 'bf',
          value: commission,
        },
        {
          title: 'pf',
          value: fee,
        },
      ].map(({ value, title }) => (
        <div className='text-xs/[15px] text-gray-300 flex flex-row justify-between'>
          {t(`portfolio.orderTable.${title}`)}
          <span className='ml-9'>
            {value} {currency}
          </span>
        </div>
      ))}
    </div>
  )
  return (
    <div>
      <IconWithTooltip
        iconOrTextClassName='text-xs/[15px] font-normal border-b border-dashed'
        text={`${sumFees} ${currency}`}
        tooltip={tooltip}
      />
    </div>
  )
}

export function TextCellWithTranslation(props: { text: string; className?: string }) {
  const { t } = useTranslation()
  return <div className={cn('text-xs/4 font-normal', props.className)}>{t(props.text)}</div>
}

export function AmountCell(props: { amount: string; className?: string }) {
  return <TextCell className={props.className} text={formatAssetMount(props.amount)} />
}

export function OrderTypeCell(props: { orderType: OrderType; className?: string }) {
  const { t } = useTranslation()
  const { orderType, className } = props

  return (
    <TextCell
      text={orderType === 0 ? t('assets.order.limit') : t('assets.order.market')}
      className={className}
    />
  )
}

export function ValueCell(props: { value: string; currency?: string }) {
  const { value, currency } = props
  return (
    <TextCell
      text={
        value === '0'
          ? textSuffix(value, currency ?? 'USDT')
          : textSuffix(toFixed(value, 2), currency ?? 'USDT')
      }
    />
  )
}

export function ReasonCell({ reason }: { reason: IOrder['reason'] }) {
  if (reason === 0) return <div>--</div>

  const reasonMap: Record<number, string> = {
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
  }

  const key = reasonMap[reason]

  if (!key) return <div>--</div>

  return (
    <IconWithTooltip
      iconOrTextClassName='text-xs/[15px] font-normal border-b border-dashed'
      text='portfolio.orderTable.details'
      tooltip={`portfolio.orderTable.reason.${key}`}
    />
  )
}

export function SideCell(props: { side: 0 | 1; className?: string }) {
  const { t } = useTranslation()
  const { side, className } = props

  return (
    <TextCell
      text={side === 0 ? t('assets.order.buy') : t('assets.order.sell')}
      className={cn(side === 0 ? 'text-green-50' : 'text-red-50', className)}
    />
  )
}

export function TxHashCell({ hash }: { hash: string }) {
  return (
    <div className='flex flex-row items-center gap-1.5 cursor-pointer'>
      <span className='text-xs font-medium text-blue-50 font-mono'>
        {shortenAddress(hash, 4, 4)}
      </span>
      <CopyButton copyText={hash} />
    </div>
  )
}

export function TokenCell(props: {
  icon?: string | undefined
  token: string | undefined
  name: string | undefined
  tokenClassName?: string
  nameClassName?: string
  onClick?: () => void
}) {
  return (
    <div
      className={'flex flex-row gap-2 font-normal cursor-pointer'}
      onClick={() => props.onClick?.()}
    >
      {props.icon && <LazyImage className={'w-8 h-8 rounded-[50%]'} src={props.icon} />}
      <div className='flex flex-col'>
        <div className={cn('text-sm/4.5', props.tokenClassName)}>{props.token}</div>
        <div className={cn('text-gray-400 text-xs/[15px]', props.nameClassName)}>{props.name}</div>
      </div>
    </div>
  )
}

export const openStatus = {
  value: [0, 9], // 0 待提交 // 9 待成交
  text: 'open',
  className: 'text-white',
}

export const partiallyFilledStatus = {
  value: [1], // 1 部分成交
  text: 'partiallyFilled',
  className: 'text-[rgba(255,178,25,1)]',
}

export const failedStatus = {
  value: [2], // 2 下单失败
  text: 'orderFailed',
  className: 'text-red-50',
}

export const cancelledStatus = {
  value: [3], // 3 已撤销
  text: 'cancelled',
  className: 'text-gray-400',
}

export const filledStatus = {
  value: [5], // 5 全部成交
  text: 'filled',
  className: 'text-white',
}

export const pendingCancelStatus = {
  value: [8], //8 待撤单
  text: 'pendingCancel',
  className: 'text-gray-500',
}

const ORDER_STATUS: { [key: number]: { text: string; className: string } } = [
  openStatus,
  partiallyFilledStatus,
  failedStatus,
  cancelledStatus,
  filledStatus,
  pendingCancelStatus,
].reduce((acc: { [key: number]: { text: string; className: string } }, cur) => {
  cur.value.forEach(val => {
    acc[val] = cur
  })
  return acc
}, {})

export function OrderStatusCell(props: { state: number }) {
  const { t } = useTranslation()
  const config = ORDER_STATUS[props.state]
  return (
    <div className={cn('text-xs/4 py-1 rounded-sm font-normal', config?.className || '')}>
      {config.text && t(`assets.order.state.${config.text}`)}
    </div>
  )
}

export function SessionTypeCell({ sessionType }: { sessionType: number }) {
  switch (sessionType) {
    case 0:
      return <TextCellWithTranslation text='portfolio.rthOnly' />
    case 4:
      return <TextCellWithTranslation text='portfolio.preAfter' />
    default:
      return null
  }
}

export function DropDownFilter(props: {
  data: string[]
  onDataChange: (reduce: (prev: string[]) => string[]) => void
  items: { key: string; value: string; label?: string }[]
  title: string
  itemRender?: (item: { key: string; value: string }) => ReactNode
}) {
  const { t } = useTranslation()
  const { items, itemRender } = props
  const [open, setOpen] = useState(false)

  const selectedTypes = props.data
  const setSelectedTypes = props.onDataChange

  const handleItemClick = (type: string) => {
    setSelectedTypes((prev: string[]) => {
      if (type === 'all') {
        return prev.includes('all') ? ['all'] : ['all']
      }
      // 如果点击了非"all"选项，先移除"all"
      const withoutAll = prev.filter(item => item !== 'all')
      let res = []
      if (withoutAll.includes(type)) {
        res = withoutAll.filter(item => item !== type)
      } else {
        res = [...withoutAll, type]
      }
      return res.length === 0 ? ['all'] : res
    })
  }

  return (
    <div>
      <div>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            className={cn(
              'cursor-pointer w-[211px] max-[1440px]:w-[190px] h-8 flex items-center px-3 py-2 border border-gray-850 rounded-[8px] outline-none focus:outline-none focus:ring-0',
              open ? 'border-[rgba(156,255,58,0.8)]' : ''
            )}
          >
            {selectedTypes.includes('all') ? (
              <>
                <span className='flex-1 text-left text-xs/[15px] font-normal text-gray-400'>
                  {t(`assets.order.${props.title}`)}
                </span>
                <span className='text-xs/[15px]'>{t('assets.order.all')}</span>
              </>
            ) : (
              <span className='flex-1 text-left text-xs/[15px] truncate'>
                {selectedTypes
                  .map(value => {
                    const item = items.find(item => item.value === value)
                    return item?.label || t(`assets.order.${item?.key}`)
                  })
                  .join(', ')}
              </span>
            )}
            <div className={cn('w-4.5 h-4.5 flex items-center justify-center ml-2')}>
              <VectorSVG
                className={cn('w-[7px] h-2 text-gray-400', open ? 'rotate-270' : 'rotate-90')}
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[211px] max-[1440px]:w-[190px] bg-gray-900 border-none py-0 px-0 cursor-pointer [&>div]:focus:bg-[rgba(19,24,35,1)]'
            align='end'
          >
            <div>
              <MenuItem
                keyAlias='all'
                checked={selectedTypes.includes('all')}
                handleItemClick={handleItemClick}
                value='all'
                hasSeperator={true}
              />
              <div className='max-h-[224px] overflow-auto mr-1'>
                {items.map((item: { key: string; value: string; hasSeperator?: boolean }) => {
                  const checked = selectedTypes.includes(item.value)
                  return (
                    <MenuItem
                      checked={checked}
                      handleItemClick={handleItemClick}
                      value={item.value}
                      keyAlias={item.key}
                      itemRender={itemRender}
                    />
                  )
                })}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

interface MentItemProps {
  keyAlias: string
  hasSeperator?: boolean
  value: string
  checked: boolean
  handleItemClick: (value: string) => void
  itemRender?: (item: { key: string; value: string }) => ReactNode
}

function MenuItem({
  keyAlias,
  checked,
  handleItemClick,
  value,
  hasSeperator,
  itemRender,
}: MentItemProps) {
  const { t } = useTranslation()
  return (
    <div
      key={keyAlias}
      onClick={e => e.preventDefault()}
      className={cn(
        'px-4 py-3 flex flex-row justify-between items-center w-full hover:bg-none',
        hasSeperator ? 'border-b border-white/10' : ''
      )}
    >
      <CheckBoxBySVG checked={checked} onChange={() => handleItemClick(value)} />
      <span className={cn('text-xs/[15px] font-normal', checked ? 'text-white' : 'text-gray-400')}>
        {keyAlias !== 'all' && itemRender
          ? itemRender?.({ key: keyAlias, value })
          : t(`assets.order.${keyAlias}`)}
      </span>
    </div>
  )
}

export function ScrollLoadMore<TData>(props: {
  isFetchingNextPage: boolean
  hasNextPage: boolean
  data: TData[]
  isLoading: boolean
  loadMoreRef: RefObject<HTMLDivElement | null>
  type: 'open' | 'history' | 'trade'
}) {
  const { t } = useTranslation()
  const { isFetchingNextPage, hasNextPage, data, isLoading, loadMoreRef, type } = props
  const navigate = useNavigate()

  function renderNoMoreData(showIcon: boolean) {
    return type === 'open' ? (
      <NoRecord />
    ) : (
      <NoRecordAndSeeMore
        showIcon={showIcon}
        moreLang='portfolio.seeMore'
        onClick={() => {
          navigate(`/order?type=${type}`)
        }}
      />
    )
  }

  function renderViewMore(showIcon: boolean) {
    if (type === 'open') {
      return null
    }
    return (
      <NoRecordAndSeeMore
        showIcon={showIcon}
        moreLang='portfolio.seeMore'
        onClick={() => {
          navigate(`/order?type=${type}`)
        }}
      />
    )
  }

  return (
    <>
      <div ref={loadMoreRef} className='py-1 text-xs/[15px] text-gray-400 text-center'>
        {isFetchingNextPage ? (
          <div>{t('assets.loading')}...</div>
        ) : hasNextPage ? (
          <div>{t('assets.scrollToLoadMore')}</div>
        ) : data.length > 0 ? (
          renderViewMore(false)
        ) : null}
      </div>
      {!isLoading && data.length === 0 && renderNoMoreData(true)}
    </>
  )
}

// 资产的数量统一处理成: 小于1保留5位，大于1保留两位。进位四舍五入
export function formatAssetMount(amount: string | number) {
  const bnAmount = new BigNumber(amount)
  if (!bnAmount.isFinite() || bnAmount.isNaN()) {
    return '0'
  }
  // 处理零值
  if (bnAmount.isZero()) {
    return '0'
  }
  // 四舍五入取整
  return bnAmount.toFixed(0, BigNumber.ROUND_HALF_UP)
}

export function isRiskLocked(riskType: RiskType) {
  return riskType === 1
}

export function RiskLockFlag(props: { riskType: RiskType }) {
  const { t } = useTranslation()
  return (
    <div className='absolute top-[4px] left-[5px] '>
      <button className='flex flex-row items-center cursor-pointer justify-center gap-1 bg-[rgba(246,70,93,0.1)] font-medium text-[10px]/3 rounded-lg w-[80px] px-1 h-4'>
        <img className='w-2 h-2' src='/images/icons/assets/issue.png' />
        {t('assets.order.rk')}
      </button>
    </div>
  )
}

export function TokenFilterItem(props: { icon?: string; symbol?: string; name?: string }) {
  return (
    <div className={'flex flex-row gap-1.5'}>
      {/* <LazyImage className={'w-8 h-8 rounded-[50%]'} src={props?.icon || ''} /> */}
      <div className='w-[82px] text-right w-max-[82px] flex flex-col font-normal'>
        <div className='text-xs/[15px]'>{props?.symbol}</div>
        <div className='text-[10px]/[13px] truncate'>{props?.name}</div>
      </div>
    </div>
  )
}
