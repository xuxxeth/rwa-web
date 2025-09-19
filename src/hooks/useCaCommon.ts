import {
  WalletProvider as Provider,
  xLayerTestnet,
  bscTestnet,
  defaultChains
} from 'ca-common-web'

export const WalletProvider = Provider

export function useChains() {
  return defaultChains
}

export function useTestnetChains() {
  return [bscTestnet, xLayerTestnet]
}

export * from 'ca-common-web'