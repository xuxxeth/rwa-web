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
import { textSuffix, toFixed } from '@/utils'
import type { OrderType, RiskType } from '@/service/scan/types'
import BigNumber from 'bignumber.js'
import { NoData } from '@/components/markets/NoData'

export type OrderChanged = {
  orderId: string,
  eventTime: number
  status: string
} | null
export type OrderChangedStatus = 'NEW' | 'FILLED' | 'PENDING_CANCEL' | 'CANCELLED' | "PARTIALLY_FILLED" | "FAILED"

export function checkOrderChangedEqual(a: OrderChanged | null, b: OrderChanged | null) {
  if (a === null || b === null) return false
  return a.orderId === b.orderId && a.eventTime === b.eventTime && a.status === b.status
}

export function TextCell(props: { text: string | number; className?: string }) {
  return <div className={cn('text-sm/5.5 font-normal', props.className)}>{props.text}</div>
}

export function TextCellWithTranslation(props: { text: string; className?: string }) {
  const { t } = useTranslation()
  return <div className={cn('text-sm/5.5 font-normal', props.className)}>{t(props.text)}</div>
}

export function AmountCell(props: { amount: string }) {
  return <TextCell text={formatAssetMount(props.amount)} />
}

export function OrderTypeCell(props: { orderType: OrderType }) {
  const { t } = useTranslation()
  const { orderType } = props

  return <TextCell text={orderType === 0 ? t('assets.order.limit') : t('assets.order.market')} />
}

export function ValueCell(props: { value: string, currency?: string }) {
  const { value, currency } = props
  return (
    <TextCell
      text={value === '0' ? textSuffix(value, currency ?? 'USDT') : textSuffix(toFixed(value, 2), currency ?? 'USDT')}
    />
  )
}

export function SideCell(props: { side: 0 | 1 }) {
  const { t } = useTranslation()
  const { side } = props

  return (
    <TextCell
      text={side === 0 ? t('assets.order.buy') : t('assets.order.sell')}
      className={side === 0 ? 'text-[rgba(33,201,94,1)]' : 'text-[rgba(255,89,60,1)]'}
    />
  )
}

export function TxHashCell({ hash }: { hash: string }) {
  return (
    <div className='flex flex-row items-center gap-2 cursor-pointer'>
      <span className='text-sm font-medium text-[rgba(26,133,255,1)] font-mono'>
        {shortenAddress(hash, 4, 4)}
      </span>
      <CopyButton copyText={hash} />
    </div>
  )
}

export function TokenCell(props: {
  icon: string | undefined
  token: string | undefined
  name: string | undefined
}) {
  return (
    <div className={'flex flex-row gap-2'}>
      {/* {props.icon && <LazyImage className={'w-10 h-10 rounded-[50%]'} src={props.icon} />} */}
      <div className='flex flex-col'>
        <div className='text-sm/6'>{props.token}</div>
        <div className='text-60 text-xs/4.5'>{props.name}</div>
      </div>
    </div>
  )
}

export const openStatus = {
  value: [0, 9], // 0 待提交 // 9 待成交
  text: 'open',
  className: 'text-[rgba(38,192,226,1)] bg-[rgba(38,192,226,0.1)]',
}

export const partiallyFilledStatus = {
  value: [1], // 1 部分成交
  text: 'partiallyFilled',
  className: 'text-[rgba(242,147,57,1)] bg-[rgba(242,147,57,0.1)]',
}

export const failedStatus = {
  value: [2], // 2 下单失败
  text: 'orderFailed',
  className: 'text-[rgba(209,26,42,1)] bg-[rgba(209,26,42,0.1)]',
}

export const cancelledStatus = {
  value: [3], // 3 已撤销
  text: 'cancelled',
  className: 'text-[rgba(130,134,145,1)] bg-[rgba(130,134,145,0.1)]',
}

export const filledStatus = {
  value: [5], // 5 全部成交
  text: 'filled',
  className: 'text-[rgba(58,151,76,1)] bg-[rgba(58,151,76,0.1)]',
}

export const pendingCancelStatus = {
  value: [8], //8 待撤单
  text: 'pendingCancel',
  className: 'text-[rgba(130,134,145,1)] bg-[rgba(130,134,145,0.1)]',
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
    <button className={cn('text-xs/4.5 px-2 py-1 rounded-sm font-medium', config?.className || '')}>
      {config.text && t(`assets.order.state.${config.text}`)}
    </button>
  )
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
              'cursor-pointer w-[211px] h-10 flex items-center px-4 py-2 border border-white/10 rounded-lg',
              open ? 'border-[rgba(156,255,58,0.5)]' : ''
            )}
          >
            {selectedTypes.includes('all') ? (
              <>
                <span className='flex-1 text-left text-sm font-medium'>
                  {t(`assets.order.${props.title}`)}
                </span>
                <span className='text-sm'>{t('assets.order.all')}</span>
              </>
            ) : (
              <span className='flex-1 text-left text-sm font-medium truncate'>
                {selectedTypes
                  .map(value => {
                    const item = items.find(item => item.value === value)
                    return item?.label || t(`assets.order.${item?.key}`)
                  })
                  .join(', ')}
              </span>
            )}
            <div className={cn('w-4.5 h-4.5 flex items-center justify-center ml-2')}>
              <VectorSVG className={cn('w-[7px] h-3', open ? 'rotate-270' : 'rotate-90')} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[211px] bg-[rgba(19,24,35,1)] border-none py-0 px-0 cursor-pointer [&>div]:focus:bg-[rgba(19,24,35,1)]'
            align='end'
          >
            <div>
              <MenuItem keyAlias="all" checked={selectedTypes.includes('all')} handleItemClick={handleItemClick} value="all" hasSeperator={true} />
              <div className='max-h-[224px] overflow-auto mr-1'>
                {items.map(
                  (item: { key: string; value: string; hasSeperator?: boolean }) => {
                    const checked = selectedTypes.includes(item.value)
                    return <MenuItem checked={checked} handleItemClick={handleItemClick} value={item.value} keyAlias={item.key} itemRender={itemRender} />
                  }
                )}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div >
  )
}

interface MentItemProps {
  keyAlias: string
  hasSeperator?: boolean
  value: string,
  checked: boolean
  handleItemClick: (value: string) => void
  itemRender?: (item: { key: string; value: string }) => ReactNode
}

function MenuItem({ keyAlias, checked, handleItemClick, value, hasSeperator, itemRender }: MentItemProps) {
  const { t } = useTranslation()
  return <div
    key={keyAlias}
    onClick={e => e.preventDefault()}
    className={cn('px-4 py-3 flex flex-row justify-between items-center w-full hover:bg-none', hasSeperator ? 'border-b border-white/10' : '')}
  >
    <CheckBoxBySVG checked={checked} onChange={() => handleItemClick(value)} />
    <span
      className={cn(
        'text-base/6  font-medium',
        checked ? 'text-white' : 'text-[rgba(108,134,173,1)]'
      )}
    >
      {keyAlias !== 'all' && itemRender
        ? itemRender?.({ key: keyAlias, value })
        : t(`assets.order.${keyAlias}`)}
    </span>
  </div>
}

export function ScrollLoadMore<TData>(props: {
  isFetchingNextPage: boolean
  hasNextPage: boolean
  data: TData[]
  isLoading: boolean
  loadMoreRef: RefObject<HTMLDivElement | null>
}) {
  const { t } = useTranslation()
  const { isFetchingNextPage, hasNextPage, data, isLoading, loadMoreRef } = props
  return (
    <>
      <div ref={loadMoreRef} className='py-4 text-center'>
        {isFetchingNextPage ? (
          <div className='text-gray-500'>{t('assets.loading')}...</div>
        ) : hasNextPage ? (
          <div className='text-gray-400'>{t('assets.scrollToLoadMore')}</div>
        ) : data.length > 0 ? (
          <div className='text-gray-400'>{t('assets.noMoreData')}</div>
        ) : null}
      </div>
      {isLoading && data.length === 0 && (
        <div className='py-8 text-center text-gray-500'>{t('assets.loading')}...</div>
      )}
      {!isLoading && data.length === 0 && (
        <div className='py-[90px] text-center text-gray-400'><NoData /></div>

      )}
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
      <div className='w-[82px] w-max-[82px] flex flex-col font-normal'>
        <div className='text-sm/[17px]'>{props?.symbol}</div>
        <div className='text-60 text-xs/[15px] truncate'>{props?.name}</div>
      </div>
    </div>
  )
}
