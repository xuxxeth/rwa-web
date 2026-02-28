import { useBaseStore } from "@/stores/baseStore"
import { useKycStore } from "@/stores/kycStore"
import { useSettingStore } from "@/stores/settingStore"
import { useTradeStore } from "@/stores/tradeStore"

export function useTradeStoreBindings() {
  const marketInfo = useBaseStore(state => state.marketInfo)
  const freshTokenBalances = useBaseStore(state => state.freshTokenBalances)
  const riskUserConfig = useKycStore(state => state.riskUserConfig)
  const showConfirm = useSettingStore(state => state.showConfirm)

  const updateLimitPrice = useTradeStore(state => state.updateLimitPrice)
  const updateInputSize = useTradeStore(state => state.updateInputSize)
  const updateExpires = useTradeStore(state => state.updateExpires)
  const setTxError = useTradeStore(state => state.setTxError)
  const setTxSuccess = useTradeStore(state => state.setTxSuccess)
  const setTxStep = useTradeStore(state => state.setTxStep)
  const updateSlippage = useTradeStore(state => state.updateSlippage)

  const limitPrice = useTradeStore(state => state.limitPrice)
  const inputSize = useTradeStore(state => state.inputSize)
  const expires = useTradeStore(state => state.expires)
  const inputToken = useTradeStore(state => state.inputToken)
  const outputToken = useTradeStore(state => state.outputToken)
  const action = useTradeStore(state => state.activeConvertTab) as "buy" | "sell"
  const realtimeData = useTradeStore(state => state.realtimeRwaData)
  const slippage = useTradeStore(state => state.slippage)

  return {
    marketInfo,
    freshTokenBalances,
    riskUserConfig,
    showConfirm,
    updateLimitPrice,
    updateInputSize,
    updateExpires,
    setTxError,
    setTxSuccess,
    setTxStep,
    updateSlippage,
    limitPrice,
    inputSize,
    expires,
    inputToken,
    outputToken,
    action,
    realtimeData,
    slippage,
  }
}
