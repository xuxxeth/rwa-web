import { type ReactNode, Fragment } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { SortButton } from '@/components/sort-button-svg'
import { cn } from '@/utils'
import type { Sort, Order } from '@/hooks/useTableHelper'

export type ITableConfig<T, U> = Array<{
  key: string
  sortable: boolean
  sorter?: (a: T, b: T) => (order: Order) => number
  render: (item: T, extra: U) => ReactNode
  width?: number
  // 是否在空格处换行
  breakOnSpace?: boolean
}>

export function TableBody<T, Extra>(props: {
  data: T[]
  config: ITableConfig<T, Extra>
  extra: Extra
  getKey: (item: T) => string | number
  className?: string
  dynamicClassName?: (item: T) => string
  ExtraComponent?: (props: { item: T }) => ReactNode
}) {
  const { data, config, extra, getKey, ExtraComponent } = props
  return data.map((item: T) => {
    return (
      <div
        key={getKey(item)}
        className={cn(
          'flex flex-row px-4 border-b border-white/10',
          props.className,
          props.dynamicClassName?.(item) || ''
        )}
      >
        {config.map(({ render, width, key }) => {
          const style = width ? { flexBasis: width } : { flex: 1 }
          return (
            <div key={key} className='flex flex-row items-center h-20' style={style}>
              {render(item, extra)}
            </div>
          )
        })}
        {ExtraComponent && <ExtraComponent item={item} />}
      </div>
    )
  })
}

export function TableHeader<SortableField extends string, Item, Extra>({
  lngPrefix = '',
  sort,
  onSortChange,
  config,
  className,
}: {
  lngPrefix?: string
  className?: string
  config: ITableConfig<Item, Extra>
  sort: Sort | null
  onSortChange: (field: SortableField) => void
}) {
  const { t } = useTranslation()
  return (
    <div
      className={cn('flex px-4 mt-4 flex-row h-12 border-t border-b border-white/10', className)}
    >
      {config.map(({ key, sortable, width, breakOnSpace }) => {
        const style = width ? { flexBasis: width } : { flex: 1 }
        const order = sort?.field === key ? sort.order : undefined
        const text = t(`${lngPrefix}.${key}`)
        return (
          <div
            key={key}
            className={cn('flex flex-row items-center text-white/60 text-sm/11.5 font-medium py-3')}
            style={style}
          >
            <button
              className='cursor-pointer flex flex-row items-center'
              onClick={() => {
                onSortChange(key as SortableField)
              }}
            >
              <span className='mr-0.5 text-sm/3.5 font-medium text-left'>
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
