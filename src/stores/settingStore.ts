import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface SettingStore {
  showConfirm: boolean
  setShowConfirm: (show: boolean) => void
}

export const useSettingStore = create<SettingStore>()(
  persist((set, get) => ({
    showConfirm: true,
    setShowConfirm: (show: boolean) => {
      set({ showConfirm: show })
    },
  }), 
  {
    name: "CA_WEB_SETTING",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      showConfirm: state.showConfirm,
    }),
  })
)