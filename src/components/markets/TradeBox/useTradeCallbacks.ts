import { useCallback } from "react"

interface UseTradeCallbacksParams {
  onPriceInput: (value: string) => void
  updateInputSize: (value: string) => void
  updateExpires: (value: number) => void
}

export function useTradeCallbacks({
  onPriceInput,
  updateInputSize,
  updateExpires,
}: UseTradeCallbacksParams) {
  const handlePriceChange = useCallback((value: string) => {
    onPriceInput(value)
  }, [onPriceInput])

  const handleSizeChange = useCallback((value: string) => {
    updateInputSize(value)
  }, [updateInputSize])

  const handleExpiresChange = useCallback((value: number) => {
    updateExpires(value)
  }, [updateExpires])

  return {
    handlePriceChange,
    handleSizeChange,
    handleExpiresChange,
  }
}
