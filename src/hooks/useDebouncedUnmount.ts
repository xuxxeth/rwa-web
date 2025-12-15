// 确保组件在真正卸载时候才执行回调，并能处理 React StrictMode 的情况
import { useEffect, useRef } from 'react'

export default function useDebouncedUnmount(callback?: () => void, delay = 0) {
  // 使用 ref 存储 callback, 避免有闭包问题
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // StrictMode 处理：如果组件立刻重新挂载，取消之前的重置定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    return () => {
      // 延迟执行重置逻辑
      timerRef.current = setTimeout(() => {
        callbackRef.current?.()
      }, delay)
    }
  }, [delay])
}
