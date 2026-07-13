import { useState, useEffect } from 'react'
import type { IAggregateData } from '@/service/webSocket/types'
import { calculateUp, strOrNumToSign } from '@/utils'
import wsService from '@/service/webSocket/service'
import type { IRwa, IStock } from '@/service/base/types'

// 给 RWA 列表添加价格和涨跌幅
export function useRwaWithPriceAndUp(rwaList: IRwa[]) {
  const [tokenWithUp, setTokenWithUp] = useState<
    Record<number, { up: string | undefined; price: number | undefined }>
  >({})

  useEffect(() => {
    const listener = (data: IAggregateData) => {
      const items = data.items

      const upMap = items.reduce(
        (acc: Record<number, { up: string | undefined; price: number | undefined }>, cur) => {
          acc[cur.s] = {
            price: cur.p,
            up: cur.p && cur.o ? calculateUp(cur.p, cur.o) : undefined,
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
    const stockId = rwa.stockId
    const priceAndUp = tokenWithUp[stockId]
    const up = priceAndUp?.up
    const change = strOrNumToSign(up || 0)
    return {
      ...rwa,
      price: priceAndUp?.price,
      up,
      change,
    }
  })
}

// 给 Stock 列表添加价格和涨跌幅
export function useStockWithPriceAndUp(stockList: IStock[]) {
  const [stockWithUp, setStockWithUp] = useState<
    Record<number, { up: string | undefined; price: number | undefined }>
  >({})

  useEffect(() => {
    const listener = (data: IAggregateData) => {
      const items = data.items

      const upMap = items.reduce(
        (acc: Record<number, { up: string | undefined; price: number | undefined }>, cur) => {
          acc[cur.s] = {
            price: cur.p,
            up: cur.p && cur.o ? calculateUp(cur.p, cur.o) : undefined,
          }
          return acc
        },
        {}
      )

      setStockWithUp(upMap)
    }

    wsService.on('aggregate', listener)

    return () => {
      wsService.off('aggregate', listener)
    }
  }, [])

  return stockList.map(stock => {
    const stockId = stock.id;
    const priceAndUp = stockWithUp[stockId]
    const up = priceAndUp?.up
    const change = strOrNumToSign(up || 0)
    return {
      ...stock,
      price: priceAndUp?.price,
      up,
      change,
    }
  })
}
