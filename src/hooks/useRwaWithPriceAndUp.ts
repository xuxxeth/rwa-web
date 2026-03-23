import { useState, useEffect } from 'react'
import type { IAggregateData } from '@/service/webSocket/types'
import { symbolToLower, truncate, calculateUp, strOrNumToSign } from '@/utils'
import wsService from '@/service/webSocket/service'
import type { IRwa } from '@/service/base/types'

// 给 RWA 列表添加价格和涨跌幅
function useRwaWithPriceAndUp(rwaList: IRwa[]) {
  const [tokenWithUp, setTokenWithUp] = useState<
    Record<string, { up: string | undefined; price: string | undefined }>
  >({})

  useEffect(() => {
    const listener = (data: IAggregateData) => {
      const items = data.items

      const upMap = items.reduce(
        (acc: Record<string, { up: string | undefined; price: string | undefined }>, cur) => {
          acc[symbolToLower(cur.S)] = {
            // 盘中价格
            price: cur.c ? truncate(cur.c, 2) : undefined,
            // 盘中价格涨跌幅
            up: cur.c && cur.pc ? calculateUp(cur.c, cur.pc) : '0',
          }
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
  }, [])

  return rwaList.map(rwa => {
    const key = symbolToLower(rwa.symbol)
    const up = tokenWithUp[key]?.up
    const change = strOrNumToSign(up || 0)
    return {
      ...rwa,
      price: tokenWithUp[key]?.price,
      up,
      change,
    }
  })
}

export default useRwaWithPriceAndUp
