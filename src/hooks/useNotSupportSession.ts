import { MARKET_STATUS } from "@/config/constants";
import type { IRwa } from "@/service/base/types";
import { useMemo } from "react";
import { useTranslation } from "./useTranslation";

export function useNotSupportSession(marketTradeState: number, inputToken: IRwa | null) {
  const { t } = useTranslation()
  
  const notSupportBeforeOrAfter = useMemo(() => {
    if (!inputToken) {
      return {
        notSupport: false,
        session: ''
      }
    }
    if ((inputToken.sessionMaskList?.[1] === 0 && marketTradeState === MARKET_STATUS.AFTER) || 
      (inputToken.sessionMaskList?.[2] === 0 && marketTradeState === MARKET_STATUS.BEFORE)) {
      return {
        notSupport: true,
        session: marketTradeState === MARKET_STATUS.AFTER ? t("v3.t29") : t("v3.t27")
      }
    }
    return {
      notSupport: false,
      session: ''
    }
  }, [inputToken, marketTradeState, t])

  const notSupportOvernight = useMemo(() => {
    if (!inputToken) {
      return {
        notSupport: false,
        session: ''
      }
    }
    if (inputToken.sessionMaskList?.[0] === 0 && marketTradeState === MARKET_STATUS.OVERNIGHT) {
      return {
        notSupport: true,
        session: t("marketQuotes.overnight")
      }
    }
    return {
      notSupport: false,
      session: ''
    }
  }, [inputToken, marketTradeState, t])

  return {
    notSupportBeforeOrAfter,
    notSupportOvernight
  }
}