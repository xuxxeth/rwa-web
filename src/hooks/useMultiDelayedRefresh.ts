import { useRef, useEffect, useCallback } from 'react' // 导入 useCallback

export function useMultiDelayedRefresh(
  refreshFn: () => Promise<void>,
  delays: number[] = [0, 300, 700, 1000] // 默认的刷新间隔
) {
  const timerRefs = useRef<(ReturnType<typeof setTimeout> | null)[]>([])

  const startRefresh = useCallback(() => {
    // 清除之前可能存在的定时器
    timerRefs.current.forEach(timer => timer && clearTimeout(timer))
    timerRefs.current = [] // 重置定时器数组

    delays.forEach(delay => {
      const timer = setTimeout(() => {
        refreshFn()
      }, delay)
      timerRefs.current.push(timer)
    })
  }, [refreshFn, delays]) // 依赖 refreshFn 和 delays，确保使用最新值

  useEffect(() => {
    return () => {
      // 在组件卸载时清除所有定时器
      timerRefs.current.forEach(timer => timer && clearTimeout(timer))
    }
  }, []) // 空依赖数组表示只在组件挂载和卸载时执行清理

  return { startRefresh }
}
