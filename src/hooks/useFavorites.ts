import { useChainId, useAccount } from 'ca-common-web'
import { useAppStore } from '@/stores/appStore'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { ucApi } from '@/service/uc/api'
import { useSignatureValidStatus } from '@/hooks/useSignature'
import useDebounce from '@/hooks/useDebounce'

function useFavorites() {
  const isWalletConnecting = useAppStore(state => state.isWalletConnecting)
  const chainId = useChainId()
  const account = useAccount()

  const favorites = useAppStore(state => state.favorites)
  const setFavorites = useAppStore(state => state.setFavorites)

  const [isLoading, setIsLoading] = useState(false)

  const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await ucApi.getFavorites()
      setFavorites(res.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addFavorite = useCallback(async (stockId: number) => {
    try {
      const res = await ucApi.addFavorite(stockId)
      if (res.code === 9200) {
        await fetchFavorites()
        return true
      }
      return false
    } catch (err) {
      console.error(err)
      return false
    }
  }, [])

  const removeFavorite = useCallback(async (stockId: number) => {
    try {
      const res = await ucApi.removeFavorite(stockId)
      if (res.code === 9200) {
        await fetchFavorites()
        return true
      }
      return false
    } catch (err) {
      console.error(err)
      return false
    }
  }, [])

  useEffect(() => {
    if (!account || !chainId) {
      setFavorites([])
      return
    }
    if (!isSignatureValid) {
      setFavorites([])
      return
    }
    fetchFavorites()
  }, [account, chainId, isSignatureValid, fetchFavorites])

  const favoritesSet = useMemo(() => new Set(favorites), [favorites])

  const isFavorite = useCallback(
    (stockId: number) => {
      return favoritesSet.has(stockId)
    },
    [favoritesSet]
  )

  const toggleFavorite = useCallback(
    async (stockId: number) => {
      if (isFavorite(stockId)) {
        return await removeFavorite(stockId)
      } else {
        return await addFavorite(stockId)
      }
    },
    [isFavorite]
  )

  const debouncedToggleFavorite = useDebounce(toggleFavorite, 200)

  return {
    isWalletConnecting,
    chainId,
    account,
    favoritesSet,
    isLoading,
    isFavorite,
    fetchFavorites,
    isSignatureValid,
    refreshIsSignatureValid,
    toggleFavorite: debouncedToggleFavorite,
    toggleEnable: !!(account && chainId && isSignatureValid)
  }
}

export default useFavorites
