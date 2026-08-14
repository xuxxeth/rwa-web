import { useCallback, useMemo, useRef, useState } from 'react'

type Cursor = number | undefined

interface UseCursorPaginationOptions<T> {
  /**
   * 每页数量
   */
  pageSize: number

  /**
   * 获取每条数据的 Cursor
   */
  getCursor: (item: T) => Cursor
}

interface UpdateOptions<T> {
  /**
   * 接口返回的数据
   */
  list: T[]

  /**
   * true：下一页
   * false：上一页
   */
  next: boolean
}

export function useCursorPagination<T>({
  pageSize,
  getCursor,
}: UseCursorPaginationOptions<T>) {
  const beforeRef = useRef<Cursor>(undefined)
  const afterRef = useRef<Cursor>(undefined)

  const [prevEnabled, setPrevEnabled] = useState(false)
  const [nextEnabled, setNextEnabled] = useState(false)

  /**
   * 获取请求参数
   */
  const getParams = useCallback(
    (next: boolean) => {
      return {
        before: next ? undefined : beforeRef.current,
        after: next ? afterRef.current : undefined,
        limit: pageSize,
      }
    },
    [pageSize]
  )

  /**
   * 根据接口返回更新分页状态
   */
  const update = useCallback(
    ({ list, next }: UpdateOptions<T>) => {
      if (list.length === 0) {
        if (next) {
          setPrevEnabled(true)
          setNextEnabled(false)
        } else {
          setPrevEnabled(false)
          setNextEnabled(true)
        }
        return
      }

      beforeRef.current = getCursor(list[0])
      afterRef.current = getCursor(list[list.length - 1])

      if (next) {
        setPrevEnabled(true)
      }

      setNextEnabled(list.length >= pageSize)
    },
    [getCursor, pageSize]
  )

  /**
   * 重置分页
   */
  const reset = useCallback(() => {
    beforeRef.current = undefined
    afterRef.current = undefined

    setPrevEnabled(false)
    setNextEnabled(false)
  }, [])

  /**
   * 是否显示分页
   */
  const show = useCallback(
    (length: number) => {
      return length >= pageSize || prevEnabled || nextEnabled
    },
    [pageSize, prevEnabled, nextEnabled]
  )

  /**
   * Pagination Props
   */
  const paginationProps = useMemo(
    () => ({
      prevDisabled: !prevEnabled,
      nextDisabled: !nextEnabled,
    }),
    [prevEnabled, nextEnabled]
  )

  return {
    /**
     * 当前分页状态
     */
    prevEnabled,
    nextEnabled,

    /**
     * 获取请求参数
     */
    getParams,

    /**
     * 更新分页状态
     */
    update,

    /**
     * 重置
     */
    reset,

    /**
     * 是否显示 Pagination
     */
    show,

    /**
     * Pagination Props
     */
    paginationProps,
  }
}