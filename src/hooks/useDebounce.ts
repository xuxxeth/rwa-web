import { useEffect, useRef, useCallback } from 'react'

function useDebounce(fn: (...args: any[]) => void, delay: number) {
  const ref = useRef(fn)
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    ref.current = fn
  }, [fn])

  const debounceFn = useCallback(
    (...args: any[]) => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
      timer.current = setTimeout(() => {
        ref.current(...args)
      }, delay)
    },
    [delay]
  )

  return debounceFn
}

export default useDebounce
