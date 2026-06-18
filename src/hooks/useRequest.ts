import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'

export type RequestState<T> = {
  data: T | null
  loading: boolean
  error: string | null
}

export function useRequest<T>(
  request: () => Promise<T | null>,
  deps: DependencyList,
  options?: {
    immediate?: boolean
    initialData?: T | null
  }
) {
  const { immediate = true, initialData = null } = options || {}

  const requestRef = useRef(request)
  requestRef.current = request

  const seqRef = useRef(0)

  const [state, setState] = useState<RequestState<T>>({
    data: initialData,
    loading: false,
    error: null,
  })

  const run = useCallback(async () => {
    const seq = ++seqRef.current

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const data = await requestRef.current()
      if (seq !== seqRef.current) return null
      setState({ data, loading: false, error: null })
      return data
    } catch (err) {
      if (seq !== seqRef.current) return null
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Request failed',
      })
      return null
    }
  }, [])

  useEffect(() => {
    if (!immediate) return
    run()
  }, deps)

  useEffect(() => {
    return () => {
      seqRef.current += 1
    }
  }, [])

  return { ...state, run }
}
