import { useEffect, useRef, type RefObject } from 'react'

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onClickOutside: () => void,
  enabled = true,
) {
  const handlerRef = useRef(onClickOutside)

  useEffect(() => {
    handlerRef.current = onClickOutside
  }, [onClickOutside])

  useEffect(() => {
    if (!enabled) return

    const handlePointerDown = (event: PointerEvent) => {
      const el = ref.current
      if (!el || el.contains(event.target as Node)) return

      handlerRef.current()
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => document.removeEventListener('pointerdown', handlePointerDown, true)
  }, [enabled, ref])
}
