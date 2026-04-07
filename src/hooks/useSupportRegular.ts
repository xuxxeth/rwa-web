import { SUPPORT_REGULAR_PROD, SUPPORT_REGULAR_TEST } from "@/config/constants";

export const isTiko = import.meta.env.VITE_API_BASE.includes('tiko.cc')

export function useSupportRegular() {
  const isSupportRegular = (symbol: string) => {
    const SUPPORT_REGULAR = !isTiko ? SUPPORT_REGULAR_TEST : SUPPORT_REGULAR_PROD
    return SUPPORT_REGULAR.includes(symbol.slice(0, symbol.length - 1))
  }

  return {
    isSupportRegular
  }
}