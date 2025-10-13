import { useEffect, useMemo, useState } from 'react'
import type { IToken, IRwa } from '@/service/base/types'
import { marketQuoteOptions } from '@/queries'
import { useQuery } from '@tanstack/react-query'
import type { IMarketQuote } from '@/service/quote/types'
import { useTokenBalances } from '@/hooks/useCaCommon'
import { formatAmount, multiply, sum, symbolToLower } from '@/utils/index'
import { useTokens, useRwaTokens } from '@/hooks/useTokens'
import { useBaseStore } from '@/stores/baseStore'

export function useAssetsList(chainId: number, account: string) {
  const tokenList = useTokens()
  const rwaList = useRwaTokens()

  const tokenWithBalance = useBaseStore(state => state.tokenWithBalance)
  const tokenWithPrice = useBaseStore(state => state.tokenWithPrice)

  const assetsList: IAssetItem[] = [
    ...tokenList.map(getAssetItemFromToken),
    ...rwaList.map(getAssetItemFromRwa),
  ].map(token => {
    const symbolLowdered = symbolToLower(token.symbol)
    const balanceFromStore = tokenWithBalance[symbolLowdered]
    const priceFromStore = tokenWithPrice[symbolLowdered]
    token.holdings =

      balanceFromStore && balanceFromStore.origin != '0' ? balanceFromStore.balance : undefined
    token.rwaPrice = priceFromStore ? priceFromStore.price : undefined
    const calculatePrice = token.tokenPrice ?? token.rwaPrice
    
    if (token.holdings !== undefined && calculatePrice !== undefined) {
      token.value = formatAmount(multiply(token.holdings, calculatePrice), 2)
    }
    return token
  })

  const estimatedBalance = sum(...assetsList.map(item => item.value ?? 0))

  return { assetsList, estimatedBalance }
}

function getAssetItemFromToken(token: IToken): IAssetItem {
  return {
    symbol: token.symbol,
    name: token.name,
    tokenPrice: '1',
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
  tokenPrice?: string
  // rwa price
  rwaPrice?: string
  value?: string
  rwaState?: number
  icon?: string
  address: string
}
