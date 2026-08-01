import type { IToken, IRwa } from '@/service/base/types'
import { multiply, sum, symbolToLower, toFixed, advancedSort, formatAmount } from '@/utils/index'
import { useTokens, useRwaTokens } from '@/hooks/useTokens'
import { useBaseStore } from '@/stores/baseStore'
import { useEffect, useState, useMemo } from 'react'
import wsService from '@/service/webSocket/service'
import type { IAggregateData } from '@/service/webSocket/types'
import { useRegulateAssets, type RegulateAssetItem } from 'ca-common-web'
import { useAppStore } from '@/stores/appStore'
import { isGreater } from '@/utils'

export interface IRiskControlAsset {
  token: string
  amount: bigint
  quantity: string
  symbol: string
}

export function useRiskControlAssets(chainId: number, account: string): IRiskControlAsset[] {
  const currentChainId = useAppStore(state => state.currentChainId)
  const chainList = useBaseStore(state => state.chainList)
  const rwaList = useRwaTokens(false)
  const tokenList = useTokens()
  const allTokens = [...tokenList, ...rwaList]

  const { getRegulateAssets } = useRegulateAssets()

  const [assets, setAssets] = useState<RegulateAssetItem[]>([])

  useEffect(() => {
    const filteredTokens = [...rwaList, ...tokenList].filter(
      item => item.chainId === currentChainId
    )
    const diamondContractAddr =
      chainList.find(chain => chain.id === currentChainId)?.contract ?? null
    if (!diamondContractAddr || !account || !filteredTokens.length) return

    getRegulateAssets(
      diamondContractAddr,
      account,
      filteredTokens.map(rwa => rwa.address)
    ).then(res => {
      setAssets(res)
    })
  }, [currentChainId, account, rwaList, tokenList, chainList])

  return Object.entries(assets.filter(item => item.amount !== 0n))
    .map(([_, { token, amount }]) => {
      const tokenInfo = allTokens.find(t => t.address === token)
      const decimals = tokenInfo?.decimals || 18
      const quantity = formatAmount(amount, decimals)
      return { token, amount, quantity, symbol: tokenInfo?.symbol || '' }
    })
    .sort((a, b) => advancedSort(a.quantity, b.quantity, 'desc'))
}

export function useAssetsList(chainId: number) {
  const tokenList = useTokens()
  const rwaList = useRwaTokens(true)

  const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)
  const [tokenWithPrice, setTokenWithPrice] = useState<Record<string, { price: number }>>({})

  const allTokenList = useMemo(() => {
    return [...tokenList.map(getAssetItemFromToken), ...rwaList.map(getAssetItemFromRwa)]
  }, [rwaList, tokenList, chainId])

  const assetsList = useMemo(() => {
    return allTokenList
      .map(token => {
        const symbolLowdered = symbolToLower(token.symbol)
        const addressLowdered = symbolToLower(token.address)
        token.price = token.isStableToken
          ? 1
          : token.splitStatus == 0
            ? tokenWithPrice[symbolLowdered]?.price
            : undefined
        const balanceFromStore = tokenWithBalance[addressLowdered]
        token.holdings =
          balanceFromStore && balanceFromStore.origin != '0' ? balanceFromStore.balance : undefined
        if (token.price && token.holdings) {
          token.value = multiply(token.holdings, token.price)
        }
        if (!token.holdings || !token.price) {
          token.value = undefined
        }
        return token
      })
      .filter(
        token =>
          token.isStableToken || (token.holdings !== undefined && isGreater(token.holdings, '0'))
      )
  }, [tokenWithBalance, allTokenList, tokenWithPrice])

  const estimatedRwaTotalValue =
    assetsList.length > 0
      ? sum(...assetsList.filter(item => item.rwaId).map(item => item.value ?? 0))
      : undefined

  const estimatedStableTokenTotalValue =
    assetsList.length > 0
      ? sum(...assetsList.filter(item => !item.rwaId).map(item => item.value ?? 0))
      : undefined

  const estimatedBalance =
    estimatedRwaTotalValue !== undefined && estimatedStableTokenTotalValue !== undefined
      ? sum(estimatedRwaTotalValue, estimatedStableTokenTotalValue)
      : undefined

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
    isStableToken: true,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    icon: token.icon,
    address: token.address,
    precision: 2,
  }
}

function getAssetItemFromRwa(rwa: IRwa): IAssetItem {
  return {
    isStableToken: false,
    rwaId: rwa.id,
    stockId: rwa.stockId,
    symbol: rwa.symbol,
    name: rwa.name,
    decimals: rwa.decimals,
    address: rwa.address,
    icon: rwa.icon,
    rwaState: rwa.state,
    sessionMask: rwa.sessionMask,
    weight: rwa.weight,
    precision: rwa.precision,
    splitStatus: rwa.splitStatus,
  }
}

export interface IAssetItem {
  isStableToken: boolean
  rwaId?: number
  stockId?: number
  symbol: string
  name?: string
  holdings?: string
  decimals?: number
  price?: number
  value?: string
  rwaState?: number
  sessionMask?: number
  icon?: string
  address: string
  weight?: number
  precision: number
  showState?: boolean
  splitStatus?: number
}
