import { type ReactNode, Fragment } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { SortButton } from '@/components/sort-button-svg'
import { cn } from '@/utils'
import type { Sort, Order } from '@/hooks/useTableHelper'
import { CircleLoading } from '@/components/loading'
import { CheckBox } from '../check-box'

export type ITableConfig<T, U> = Array<{
  key: string
  sortable: boolean
  headerDirection?: 'start' | 'end'
  sorter?: (a: T, b: T) => (order: Order) => number
  render: (item: T, extra: U) => ReactNode
  width?: number
  // 是否在空格处换行
  breakOnSpace?: boolean
  className?: string
}>

export function TableBody<T, Extra>(props: {
  data: T[]
  isLoading?: boolean
  config: ITableConfig<T, Extra>
  extra: Extra
  getKey: (item: T) => string | number
  className?: string
  dynamicClassName?: (item: T, index: number) => string
  tdClassName?: string
  ExtraComponent?: (props: { item: T }) => ReactNode
  onClick?: (item: T) => void
  showChecked?: boolean
  selectedRowKeys?: string[]
  onSelectRow?: (key: string, checked: boolean) => void
}) {
  const { data, config, isLoading, extra, getKey, tdClassName, ExtraComponent, onClick, showChecked, selectedRowKeys, onSelectRow } = props

  return (
    <div className={cn('relative', isLoading ? 'opacity-40 min-h-[150px] text-white' : '')}>
      {data.map((item: T, index: number) => {
        // @ts-ignore
        const isChecked = !!selectedRowKeys?.find(key => key === item.id)
        return (
          <div
            key={getKey(item)}
            className={cn(
              'flex flex-row px-3 border-b border-b-gray-850',
              props.className,
              props.dynamicClassName?.(item, index) || ''
            )}
            onClick={() => {
              if (onClick) {
                onClick(item)
              }
            }}
          >
            {config.map(({ render, width, key, className }, index) => {
              const style = width ? { flexBasis: width } : { flex: 1 }
              return (
                <div
                  key={key}
                  className={cn('flex flex-row items-center h-20 overflow-hidden gap-x-3', tdClassName, className)}
                  style={style}
                >
                  {index === 0 && showChecked && (
                    <CheckBox
                      checked={isChecked}
                      onChange={checked => {
                        // @ts-ignore
                        onSelectRow?.(item.id, checked)
                      }}
                    />
                  )}
                  {render(item, extra)}
                </div>
              )
            })}
            {ExtraComponent && <ExtraComponent item={item} />}
          </div>
        )
      })}
      {isLoading && (
        <CircleLoading className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
      )}
    </div>
  )
}

export function TableHeader<SortableField extends string, Item, Extra>({
  lngPrefix = '',
  sort,
  onSortChange,
  config,
  className,
  thClassName,
  showChecked,
  onSelectAll,
  isAllSelected
}: {
  lngPrefix?: string
  className?: string
  thClassName?: string
  config: ITableConfig<Item, Extra>
  sort: Sort | null
  onSortChange: (field: SortableField) => void
  showChecked?: boolean
  onSelectAll?: (checked: boolean) => void
  isAllSelected?: boolean
}) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'flex flex-row h-12 px-3 border-t border-b border-white/10 shrink-0 overflow-hidden',
        className
      )}
    >
      {config.map(({ key, sortable, headerDirection, width, breakOnSpace, className }, index) => {
        const style = width ? { flexBasis: width } : { flex: 1 }
        const order = sort?.field === key ? sort.order : undefined
        const text = t(`${lngPrefix}.${key}`)
        if (showChecked && index === 0) {
          return (
            <div
              key={key}
              className={cn(
                'flex flex-row items-center text-gray-400 text-xs gap-x-3',
                headerDirection === 'end' ? 'justify-end' : 'justify-start'
              )}
              style={style}
            >
              <CheckBox
                checked={isAllSelected}
                onChange={checked => {
                  onSelectAll?.(checked)
                }}
              />
              全选
            </div>
          )
        }
        return (
          <div
            key={key}
            className={cn(
              'flex flex-row items-center',
              headerDirection === 'end' ? 'justify-end' : 'justify-start'
            )}
            style={style}
          >
            <button
              type='button'
              className='cursor-pointer flex flex-row items-center border-none bg-transparent p-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 appearance-none'
              onClick={() => {
                onSortChange(key as SortableField)
              }}
            >
              <span className={cn('mr-0.5 text-sm/3.5 font-medium text-left', thClassName)}>
                {breakOnSpace && text.includes(' ')
                  ? text.split(' ').map((part, index) => (
                      <Fragment key={index}>
                        {index > 0 && <br />}
                        {part}
                      </Fragment>
                    ))
                  : text}
              </span>
              {sortable && (
                <div className='w-4 h-4 flex justify-center flex-row items-center'>
                  <SortButton order={order} />
                </div>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
