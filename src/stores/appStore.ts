import { create } from 'zustand'

export interface AppStore {
  isWalletConnecting: boolean
  setIsWalletConnecting: (connecting: boolean) => void
  favorites: number[]
  setFavorites: (favorites: number[]) => void
  currentChainId: number | null
  setCurrentChainId: (chainId: number | null) => void
  isSwitchingChain: boolean
  setIsSwitchingChain: (isSwitching: boolean) => void
}

export const useAppStore = create<AppStore>()((set, get) => ({
  isWalletConnecting: true,
  setIsWalletConnecting: (connecting: boolean) => {
    set({ isWalletConnecting: connecting })
  },
  currentChainId: null,
  favorites: [],
  setFavorites: (favorites: number[]) => {
    set({ favorites })
  },
  setCurrentChainId: (chainId: number | null) => {
    set({ currentChainId: chainId })
  },
  isSwitchingChain: false,
  setIsSwitchingChain: (isSwitching: boolean) => {
    set({ isSwitchingChain: isSwitching })
  },
}))
