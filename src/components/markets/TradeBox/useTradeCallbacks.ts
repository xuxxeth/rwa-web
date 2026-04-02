import { useCallback } from "react"

interface UseTradeCallbacksParams {
  onPriceInput: (value: string) => void
  updateInputSize: (value: string) => void
  updateExpires: (value: number) => void
  updateSlippage: (value: number) => void
}

export function useTradeCallbacks({
  onPriceInput,
  updateInputSize,
  updateExpires,
  updateSlippage
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

  const handleSlippageChange = useCallback((value: number) => {
    updateSlippage(value)
  }, [updateSlippage])

  return {
    handlePriceChange,
    handleSizeChange,
    handleExpiresChange,
    handleSlippageChange
  }
}
