
export const BSC_SCAN_URL = import.meta.env.VITE_BSC_SCAN_URL

export function openScanUrl(url: string, type: string = 'tx', ) {
  if (!url || typeof url !== 'string') {
    console.warn('openUrlInNewWindow: Invalid URL provided')
    return null
  }

  const _url = `${BSC_SCAN_URL}/${type}/${url}`

  window.open(_url, '_blank', 'noopener,noreferrer')
}

export function openUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}