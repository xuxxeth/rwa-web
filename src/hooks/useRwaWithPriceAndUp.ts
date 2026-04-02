import { useState, useEffect } from 'react'
import type { IAggregateData } from '@/service/webSocket/types'
import { symbolToLower, truncate, calculateUp, strOrNumToSign } from '@/utils'
import wsService from '@/service/webSocket/service'
import type { IRwa } from '@/service/base/types'
import { useBaseStore } from '@/stores/baseStore'
import { MARKET_STATUS } from '@/config/constants'

// 给 RWA 列表添加价格和涨跌幅
function useRwaWithPriceAndUp(rwaList: IRwa[]) {
  const marketTradeState = useBaseStore(state => state.marketTradeState)

  const [tokenWithUp, setTokenWithUp] = useState<
    Record<number, { up: string | undefined; price: number | undefined }>
  >({})

  useEffect(() => {
    const listener = (data: IAggregateData) => {
      const items = data.items

      const upMap = items.reduce(
        (acc: Record<number, { up: string | undefined; price: number | undefined }>, cur) => {
          const item =
            marketTradeState === MARKET_STATUS.OPEN
              ? {
                  price: cur.p,
                  up: cur.p && cur.c ? calculateUp(cur.p, cur.c) : '0',
                }
              : {
                  price: cur.c,
                  up: cur.c && cur.pc ? calculateUp(cur.c, cur.pc) : '0',
                }
          acc[cur.s] = item
          return acc
        },
        {}
      )

      setTokenWithUp(upMap)
    }

    wsService.on('aggregate', listener)

    return () => {
      wsService.off('aggregate', listener)
    }
  }, [marketTradeState])

  return rwaList.map(rwa => {
    const stockId = rwa.stockId
    const up = tokenWithUp[stockId]?.up
    const change = strOrNumToSign(up || 0)
    return {
      ...rwa,
      price: tokenWithUp[stockId]?.price,
      up,
      change,
    }
  })
}

export default useRwaWithPriceAndUp
