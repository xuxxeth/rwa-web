import { useState, type RefObject } from 'react'
import { LazyImage } from '@/components/image/LazyImage'
import { cn, shortenAddress } from '@/utils'
import { useTranslation } from '@/hooks/useTranslation'
import CopyButton from '@/components/button/copyButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import VectorSVG from '@/components/pagination/vector.svg?react'
import { CheckBoxBySVG } from '@/components/check-box'
import { textSuffix, toFixed } from '@/utils'
import type { OrderType } from '@/service/scan/types'
import BigNumber from 'bignumber.js'

export function TextCell(props: { text: string | number; className?: string }) {
  return <div className={cn('text-sm/5.5 font-normal', props.className)}>{props.text}</div>
}

export function AmountCell(props: { amount: string }) {
  return <TextCell text={formatAssetMount(props.amount)} />
}

export function OrderTypeCell(props: { orderType: OrderType }) {
  const { t } = useTranslation()
  const { orderType } = props

  return <TextCell text={orderType === 0 ? t('assets.order.limit') : t('assets.order.market')} />
}

export function ValueCell(props: { value: string }) {
  const { value } = props
  return (
    <TextCell
      text={value === '0' ? textSuffix(value, 'USDT') : textSuffix(toFixed(value, 2), 'USDT')}
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
      <span className='text-sm font-medium text-[rgba(26,133,255,1)]'>
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
    <div className='flex flex-row gap-2'>
      {props.icon && <LazyImage className='w-10 h-10 rounded-[50%]' src={props.icon} />}
      <div className='flex flex-col'>
        <div className='text-sm/6'>{props.token}</div>
        <div className='text-60 text-xs/4.5'>{props.name}</div>
      </div>
    </div>
  )
}

export const openStatus = {
  value: [0],
  text: 'open',
  className: 'text-[rgba(38,192,226,1)] bg-[rgba(38,192,226,0.1)]',
}

export const partiallyFilledStatus = {
  value: [1, 4], // 1 部分成交 4 部成撤单
  text: 'partiallyFilled',
  className: 'text-[rgba(242,147,57,1)] bg-[rgba(242,147,57,0.1)]',
}

export const failedStatus = {
  value: [2], // 2 下单失败
  text: 'orderFailed',
  className: 'text-[rgba(209,26,42,1)] bg-[rgba(209,26,42,0.1)]',
}

export const canceledStatus = {
  value: [3, 6, 7], // 3 撤单 6 废单 7 市场关闭撤单
  text: 'canceled',
  className: 'text-[rgba(130,134,145,1)] bg-[rgba(130,134,145,0.1)]',
}

export const filledStatus = {
  value: [5], // 5 完全成交
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
  canceledStatus,
  filledStatus,
  pendingCancelStatus,
].reduce((acc: { [key: number]: { text: string; className: string } }, cur) => {
  cur.value.forEach(val => {
    acc[val] = cur
  })
  return acc
}, {})

// const ORDER_STATUS: { [key: number]: { text: string; className: string } } = {
//   // 0 等待提交
//   0: openStatus,
//   // 1 部分成交
//   1: partiallyFilledStatus,
//   // 2 下单失败
//   2: failedStatus,
//   // 3 撤单
//   3: canceledStatus,
//   // 4 部成撤单
//   4: partiallyFilledStatus,
//   // 5 完全成交
//   5: filledStatus,
//   // 6 废单
//   6: canceledStatus,
//   // 7 市场关闭撤单
//   7: canceledStatus,
//   // 8 待撤单
//   8: pendingCancelStatus,
// }

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
  items: { key: string; value: string }[]
  title: string
}) {
  const { t } = useTranslation()
  const { items } = props
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
                <span>{t('assets.order.all')}</span>
              </>
            ) : (
              <span className='flex-1 text-left text-sm font-medium truncate'>
                {selectedTypes
                  .map(value => {
                    const item = items.find(item => item.value === value)
                    return t(`assets.order.${item?.key}`)
                  })
                  .join(', ')}
              </span>
            )}
            <div className={cn('w-4.5 h-4.5 flex items-center justify-center ml-2')}>
              <VectorSVG className={cn('w-[7px] h-3', open ? 'rotate-270' : 'rotate-90')} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='bg-[rgba(19,24,35,1)] border-none w-[211px] py-1 px-0 cursor-pointer [&>div]:focus:bg-[rgba(19,24,35,1)]'
            align='end'
          >
            {[
              {
                key: 'all',
                value: 'all',
                hasSeperator: true,
              },
              ...items,
            ].map(
              ({
                key,
                value,
                hasSeperator = false,
              }: {
                key: string
                hasSeperator?: boolean
                value: string
              }) => {
                const checked = selectedTypes.includes(value)
                const mentItem = (
                  <DropdownMenuItem
                    key={key}
                    onClick={e => e.preventDefault()}
                    className='px-4 py-3 flex flex-row justify-between'
                  >
                    <CheckBoxBySVG checked={checked} onChange={() => handleItemClick(value)} />
                    <span
                      className={cn(
                        'text-base/6  font-medium',
                        checked ? 'text-white' : 'text-[rgba(108,134,173,1)]'
                      )}
                    >
                      {t(`assets.order.${key}`)}
                    </span>
                  </DropdownMenuItem>
                )

                if (hasSeperator) {
                  return (
                    <>
                      {mentItem}
                      <DropdownMenuSeparator className='bg-white/10' />
                    </>
                  )
                } else {
                  return mentItem
                }
              }
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
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
        <div className='py-8 text-center text-gray-400'>{t('assets.noDataAvailable')}</div>
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
