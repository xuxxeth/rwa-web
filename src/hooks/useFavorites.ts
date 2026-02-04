import { useChainId, useAccount } from 'ca-common-web'
import { useAppStore } from '@/stores/appStore'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ucApi } from '@/service/uc/api'
import { useSignatureValidStatus } from '@/hooks/useSignature'

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

  const addFavorite = useCallback(
    async (stockId: number) => {
      try {
        const res = await ucApi.addFavorite(stockId)
        if (res.code === 9200) {
          // 为了更快的更新 UI，先更新本地状态，等服务器返回成功再刷新
          setFavorites([...favorites, stockId])

          await fetchFavorites()
          return true
        }
        return false
      } catch (err) {
        console.error(err)
        return false
      }
    },
    [favorites]
  )

  const removeFavorite = useCallback(
    async (stockId: number) => {
      try {
        const res = await ucApi.removeFavorite(stockId)
        if (res.code === 9200) {
          // 为了更快的更新 UI，先更新本地状态，等服务器返回成功再刷新
          setFavorites(favorites.filter(id => id !== stockId))

          await fetchFavorites()
          return true
        }
        return false
      } catch (err) {
        console.error(err)
        return false
      }
    },
    [favorites]
  )

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
  }, [account, chainId, isSignatureValid])

  const favoritesSet = useMemo(() => new Set(favorites), [favorites])

  const isFavorite = useCallback(
    (stockId: number) => {
      return favoritesSet.has(stockId)
    },
    [favoritesSet]
  )

  const lockRef = useRef(false)

  const toggleFavorite = useCallback(
    async (stockId: number) => {
      if (lockRef.current) return false
      lockRef.current = true

      try {
        if (isFavorite(stockId)) {
          return await removeFavorite(stockId)
        } else {
          return await addFavorite(stockId)
        }
      } finally {
        lockRef.current = false
      }
    },
    [isFavorite]
  )

  return {
    isWalletConnecting,
    chainId,
    account,
    favorites,
    isLoading,
    isFavorite,
    fetchFavorites,
    isSignatureValid,
    refreshIsSignatureValid,
    toggleFavorite,
    toggleEnable: !!(account && chainId && isSignatureValid),
  }
}

export default useFavorites
