import {
  WalletProvider as Provider,
  xLayerTestnet,
  bscTestnet,
} from 'ca-common-web'

export const WalletProvider = Provider

export function useTestnetChains() {
  return [bscTestnet, xLayerTestnet]
}

export * from 'ca-common-web'