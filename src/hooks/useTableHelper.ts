import { useState, useCallback, useMemo } from 'react'

export type Order = 'asc' | 'desc'

export type Sort = {
  field: string
  order: Order
}

export function useTableSort<SortableField extends string>() {
  const [sort, setSort] = useState<Sort | null>(null)

  const onSortChange = useCallback<(filed: SortableField) => void>(field => {
    setSort((prev: Sort | null) => {
      if (prev === null || prev.field !== field) {
        return { field, order: 'asc' }
      }
      if (prev.order === 'asc') {
        return { field, order: 'desc' }
      }
      if (prev.order === 'desc') {
        return null
      }
      return null
    })
  }, [])

  return {
    sort,
    onSortChange,
  }
}

export function usePaginationData<TData>(
  pageSize: number,
  config: Array<{
    key: string
    sorter?: (a: TData, b: TData) => (order: Order) => number
  }>,
  source: TData[],
  sort: Sort | null,
  defaultSort?: (item1: TData, item2: TData) => number
) {
  const [page, setPage] = useState(1)

  const sorter = useMemo(() => {
    if (!sort) return undefined
    return config.find(item => item.key === sort?.field)?.sorter
  }, [sort])

  const sortedData = useMemo(() => {
    if (!sort || !sorter) {
      if (defaultSort) {
        return [...source].sort(defaultSort)
      }
      return source
    }
    return [...source].sort((a, b) => sorter(a, b)(sort.order))
  }, [source, sort, sorter, defaultSort])

  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize)

  const totalPage = Math.ceil(sortedData.length / pageSize)

  return {
    paginatedData: paginatedData,
    currentPage: page,
    totalPage,
    setPage,
    pageSize,
    onPrevClick: () => {
      if (page <= 1) return
      setPage(s => s - 1)
    },
    onNextClick: () => {
      if (page >= totalPage) return
      setPage(s => s + 1)
    },
  }
}
