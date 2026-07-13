import { CONNECT_STATE_KEY } from "@/hooks/useCaCommon"
import storage from "./storage"
import { CHAIN_SCAN } from "@/config/constants"

export function openScanUrl(url: string, type: string = 'tx', ) {
  if (!url || typeof url !== 'string') {
    console.warn('openUrlInNewWindow: Invalid URL provided')
    return null
  }
  const connectState = storage.getItem(CONNECT_STATE_KEY) || {}
  const chainId = connectState.chainId || '97'
  const scanUrl = CHAIN_SCAN[chainId]
  const _url = `${scanUrl}/${type}/${url}`

  window.open(_url, '_blank', 'noopener,noreferrer')
}

export function openUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}