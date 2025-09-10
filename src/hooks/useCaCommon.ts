import {
  WalletProvider as Provider,
  bsc, 
  xLayer,
  xLayerTestnet,
  bscTestnet,
  
} from 'ca-common-web'

export const WalletProvider = Provider

export function useChains() {
  return [bsc, xLayer]
}

export function useTestnetChains() {
  return [bscTestnet, xLayerTestnet]
}

export * from 'ca-common-web'