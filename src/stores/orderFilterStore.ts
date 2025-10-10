import { create } from "zustand";

export const useOrderFilterStore = create<OrderFilterStore>()((set) => ({
  openOrderFilters: {
    side: ["all"],
    states: ["all"],
  },
  orderHistoryFilters: {
    side: ["all"],
    states: ["all"],
  },
  tradeHistoryFilters: {
    side: ["all"],
    states: ["all"],
  },

  updateOpenOrderFilters: (
    filters: Partial<OrderFilterStore["openOrderFilters"]>
  ) =>
    set((state) => ({
      openOrderFilters: { ...state.openOrderFilters, ...filters },
    })),
  updateOrderHistoryFilters: (
    filters: Partial<OrderFilterStore["orderHistoryFilters"]>
  ) =>
    set((state) => ({
      orderHistoryFilters: { ...state.orderHistoryFilters, ...filters },
    })),
  updateTradeHistoryFilters: (
    filters: Partial<OrderFilterStore["tradeHistoryFilters"]>
  ) =>
    set((state) => ({
      tradeHistoryFilters: { ...state.tradeHistoryFilters, ...filters },
    })),
}));

export interface IOpenOrderFilter {
  side?: string;
}

export function generateOpenOrderFilterObj(
  filters: OrderFilterStore["openOrderFilters"]
) {
  const filterObj: IOpenOrderFilter = {};
  if (
    !filters.side.includes("all") &&
    filters.side.length > 0 &&
    filters.side.length < 2
  ) {
    filterObj.side = filters.side.join(",");
  }
  return filterObj;
}

export interface IOpenOrderHistoryFilter {
  side?: string;
  states?: string
}

export function generateOrderHistoryFilterObj(
  filters: OrderFilterStore["orderHistoryFilters"]
) {
  const filterObj: IOpenOrderHistoryFilter = {};
  if (
    !filters.side.includes("all") &&
    filters.side.length > 0 &&
    filters.side.length < 2
  ) {
    filterObj.side = filters.side.join(",");
  }
  if (!filters.states.includes("all") && filters.states.length > 0) {
    filterObj.states = filters.states.join(",");
  }
  return filterObj;
}

export interface ITradeHistoryFilter {
  side?: string;
}

export function generateTradeHistoryFilterObj(
  filters: OrderFilterStore["tradeHistoryFilters"]
) {
  const filterObj: ITradeHistoryFilter = {};
  if (
    !filters.side.includes("all") &&
    filters.side.length > 0 &&
    filters.side.length < 2
  ) {
    filterObj.side = filters.side.join(",");
  }
  return filterObj;
} 

interface OrderFilterStore {
  openOrderFilters: {
    side: string[];
    states: string[];
  };
  orderHistoryFilters: {
    side: string[];
    states: string[];
  };
  tradeHistoryFilters: {
    side: string[];
    states: string[];
  };
  updateOpenOrderFilters: (
    filters: Partial<OrderFilterStore["openOrderFilters"]>
  ) => void;
  updateOrderHistoryFilters: (
    filters: Partial<OrderFilterStore["orderHistoryFilters"]>
  ) => void;
  updateTradeHistoryFilters: (
    filters: Partial<OrderFilterStore["tradeHistoryFilters"]>
  ) => void;
}
