import { create } from 'zustand'

export interface AppStore {
  isWalletConnecting: boolean
  setIsWalletConnecting: (connecting: boolean) => void
  favorites: number[]
  setFavorites: (favorites: number[]) => void
}

export const useAppStore = create<AppStore>()((set, get) => ({
  isWalletConnecting: true,
  setIsWalletConnecting: (connecting: boolean) => {
    set({ isWalletConnecting: connecting })
  },
  favorites: [],
  setFavorites: (favorites: number[]) => {
    set({ favorites })
  },
}))
