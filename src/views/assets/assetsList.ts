import type { IToken, IRwa } from '@/service/base/types'
import { multiply, sum, symbolToLower, toFixed } from '@/utils/index'
import { useTokens, useRwaTokens } from '@/hooks/useTokens'
import { useBaseStore } from '@/stores/baseStore'
import { useEffect, useState } from 'react'
import wsService from '@/service/webSocket/service'
import type { IAggregateData } from '@/service/webSocket/types'

export function useAssetsList(chainId: number, account: string) {
  const tokenList = useTokens()
  const rwaList = useRwaTokens(false)

  const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)
  const [tokenWithPrice, setTokenWithPrice] = useState<Record<string, { price: number }>>({})

  const assetsList: IAssetItem[] = [
    ...tokenList.map(getAssetItemFromToken),
    ...rwaList.map(getAssetItemFromRwa),
  ].map(token => {
    const symbolLowdered = symbolToLower(token.symbol)
    const balanceFromStore = tokenWithBalance[symbolLowdered]
    token.rwaPrice = tokenWithPrice[symbolLowdered]?.price

    token.holdings =
      balanceFromStore && balanceFromStore.origin != '0' ? balanceFromStore.balance : undefined

    const calculatePrice = token.tokenPrice ?? token.rwaPrice

    if (token.holdings !== undefined && calculatePrice !== undefined) {
      token.value = toFixed(multiply(token.holdings, calculatePrice), 2)
    }
    return token
  })

  const estimatedBalance = sum(...assetsList.map(item => item.value ?? 0))

  useEffect(() => {
    const listener = (data: IAggregateData) => {
      const items = data.Items

      const priceMap = items.reduce((acc: Record<string, { price: number }>, cur) => {
        acc[symbolToLower(cur.S)] = { price: cur.p }
        return acc
      }, {})

      setTokenWithPrice(priceMap)
    }

    wsService.on('aggregate', listener)

    return () => {
      wsService.off('aggregate', listener)
    }
  }, [])

  return { assetsList, estimatedBalance }
}

function getAssetItemFromToken(token: IToken): IAssetItem {
  return {
    symbol: token.symbol,
    name: token.name,
    tokenPrice: 1,
    decimals: token.decimals,
    icon: token.icon,
    address: token.address,
  }
}

function getAssetItemFromRwa(rwa: IRwa): IAssetItem {
  return {
    rwaId: rwa.id,
    symbol: rwa.symbol,
    name: rwa.name,
    decimals: rwa.decimals,
    address: rwa.address,
    icon: rwa.icon,
    rwaState: rwa.state,
    weight: rwa.weight,
  }
}

export interface IAssetItem {
  rwaId?: number
  symbol: string
  name?: string
  holdings?: string
  decimals?: number
  // token price 和 rwa price 区分开
  // token price
  tokenPrice?: number
  // rwa price
  rwaPrice?: number
  value?: string
  rwaState?: number
  icon?: string
  address: string
  weight?: number
}
