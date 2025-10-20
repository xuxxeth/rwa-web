import { useBaseStore } from "@/stores/baseStore";
import { useEffect, useRef } from "react";

export function useMarketState() {
  const getMarketState = useBaseStore(state => state.getMarketState)

  const marketTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const getMarketStateInterval = () => {
      getMarketState()
        .then(() => {
          if (!marketTimer.current) {
            marketTimer.current = setTimeout(() => {
              marketTimer.current && clearTimeout(marketTimer.current)
              marketTimer.current = null
              getMarketStateInterval()
            }, 5000)
          }
          
        })
    }
    getMarketStateInterval()

    return () => {
      marketTimer.current && clearTimeout(marketTimer.current)
      marketTimer.current = null
    }
  }, [])

}