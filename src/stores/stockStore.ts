import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type IStockData = {
  marketCap: string,
  circCap: string,
  peTtm: string,
  peStatic: string,
  pb: string
}

export interface StockStore {
  stockData: IStockData | null
  setStockData: (stockData: IStockData) => void
}

export const useStockStore = create<StockStore>()(
  persist((set, get) => ({
    stockData: null,
    setStockData: (stockData: IStockData) => {
      set({ stockData })
    },
  }), 
  {
    name: "CA_WEB_Stock",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
    }),
  })
)