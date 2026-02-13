import type { IToken, IRwa } from '@/service/base/types'
import { multiply, sum, symbolToLower, toFixed, advancedSort, formatAmount } from '@/utils/index'
import { useTokens, useRwaTokens } from '@/hooks/useTokens'
import { useBaseStore } from '@/stores/baseStore'
import { useEffect, useState } from 'react'
import wsService from '@/service/webSocket/service'
import type { IAggregateData } from '@/service/webSocket/types'
import { useRegulateAssets } from 'ca-common-web'

function useDiamondContract(chainId: number) {
  const chainList = useBaseStore(state => state.chainList)
  const chain = chainList.find(chain => chain.id === chainId)
  return chain?.contract
}

export interface IRiskControlAsset {
  token: string
  amount: bigint
  quantity: string
  symbol: string
}

export function useRiskControlAssets(chainId: number, account: string): IRiskControlAsset[] {
  const rwaList = useRwaTokens(false)
  const tokenList = useTokens()
  const diamondContract = useDiamondContract(chainId)

  const { assets, isLoading, error, refetch } = useRegulateAssets(
    diamondContract,
    account,
    [...rwaList, ...tokenList].map(rwa => rwa.address)
  )

  if (!assets) return []

  const allTokens = [...rwaList, ...tokenList]

  return Object.entries(assets.filter(item => item.amount !== 0n))
    .map(([_, { token, amount }]) => {
      const tokenInfo = allTokens.find(t => t.address === token)
      const decimals = tokenInfo?.decimals || 18
      const quantity = formatAmount(amount, decimals)
      return { token, amount, quantity, symbol: tokenInfo?.symbol || '' }
    })
    .sort((a, b) => advancedSort(a.quantity, b.quantity, 'desc'))
}

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
      token.value = multiply(token.holdings, calculatePrice)
    }
    return token
  })

  const estimatedRwaTotalValue = sum(
    ...assetsList.filter(item => item.rwaId).map(item => item.value ?? 0)
  )
  const estimatedStableTokenTotalValue = sum(
    ...assetsList.filter(item => !item.rwaId).map(item => item.value ?? 0)
  )
  const estimatedBalance = sum(estimatedRwaTotalValue, estimatedStableTokenTotalValue)

  useEffect(() => {
    const listener = (data: IAggregateData) => {
      const items = data.items

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

  return { assetsList, estimatedBalance, estimatedRwaTotalValue, estimatedStableTokenTotalValue }
}

function getAssetItemFromToken(token: IToken): IAssetItem {
  return {
    symbol: token.symbol,
    name: token.name,
    tokenPrice: 1,
    decimals: token.decimals,
    icon: token.icon,
    address: token.address,
    precision: 2,
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
    precision: rwa.precision,
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
  precision: number
}
