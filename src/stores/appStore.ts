import { create } from 'zustand'

export interface AppStore {
  isWalletConnecting: boolean
  setIsWalletConnecting: (connecting: boolean) => void
}

export const useAppStore = create<AppStore>()((set, get) => ({
  isWalletConnecting: true,
  setIsWalletConnecting: (connecting: boolean) => {
    set({ isWalletConnecting: connecting })
  },
}))