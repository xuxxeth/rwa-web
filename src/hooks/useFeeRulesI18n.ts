import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { baseApi } from '@/service/base/api'
import type { IFeeRuleI18nByLang, IFeeRulesI18n } from '@/service/base/types'
import { useTranslation } from '@/hooks/useTranslation'

function pickLangKey(language: string) {
  const normalized = String(language || '').toLowerCase()
  if (normalized.startsWith('zh')) return 'zh'
  if (normalized.startsWith('en')) return 'en'
  return 'en'
}

export function useMarketFeeConfig() {
  return useQuery({
    queryKey: ['marketFeeConfig'],
    queryFn: async () => {
      const res = await baseApi.getMarketFeeConfig()
      return (res?.data || {}) as IFeeRuleI18nByLang
    },
    staleTime: Infinity, // 数据永不过期（不会因为“变旧”而自动触发重新请求）
    gcTime: 1000 * 60 * 60 * 5, // 无组件订阅后缓存保留 5 小时；到期后从内存中回收（v5 里等同旧版 cacheTime）
    refetchOnWindowFocus: false, // 浏览器窗口重新聚焦时不自动重新请求
    refetchOnReconnect: 'always', // 网络从断开恢复时自动重新请求（staleTime=Infinity 时用 'always' 才会触发）
    refetchOnMount: false, // 组件挂载时不自动重新请求（即使数据已 stale 也不触发）
  })
}

export function useFeeRulesI18n() {
  const { i18n } = useTranslation()
  const query = useMarketFeeConfig()

  const i18nMap = useMemo<IFeeRulesI18n>(() => {
    const langKey = pickLangKey(i18n.language)
    const data = query.data

    return data?.[langKey] || data?.en || data?.zh || {}
  }, [i18n.language, query.data])

  return { data: i18nMap }
}
