import type { IRwa, IRwaWithBalancePrice } from '@/service/base/types'
import i18n from '../i18n'
export function advancedSort(
  a: string | number | undefined,
  b: string | number | undefined,
  order: 'asc' | 'desc' = 'asc',
  options: {
    numeric?: boolean
    sensitivity?: 'base' | 'accent' | 'case' | 'variant'
    // undefined 值的排序位置
    undefinedOrder: 'first' | 'last'
  } = {
    numeric: true,
    // 默认将 undefined 放在最后
    undefinedOrder: 'last',
  }
) {
  // 处理 undefined 值
  if (a === undefined && b === undefined) {
    return 0 // 两个都是 undefined，相等
  }
  if (a === undefined) {
    return options.undefinedOrder === 'first' ? -1 : 1
  }
  
  if (b === undefined) {
    return options.undefinedOrder === 'first' ? 1 : -1
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return order === 'asc' ? a - b : b - a
  }

  if (options.numeric) {
    const numA = typeof a === 'string' ? parseFloat(a) : a
    const numB = typeof b === 'string' ? parseFloat(b) : b

    if(!isNaN(numA) && !isNaN(numB)) {
      return order === 'asc' ? numA - numB : numB - numA
    }
  }

  return (
    (order === 'asc' ? 1 : -1) *
    String(a).localeCompare(String(b), i18n.language, {
      numeric: options.numeric,
      sensitivity: options.sensitivity || 'variant',
    })
  )
}

export function sortByBalanceAndPrice(arr: IRwaWithBalancePrice[]): IRwaWithBalancePrice[] {
  return arr.sort((a, b) => {
    // 将字符串转为数字，若无效则为 0
    const aBalance = parseFloat(a.balance ?? '0')
    const bBalance = parseFloat(b.balance ?? '0')
    const aPrice = parseFloat(a.price ?? '0')
    const bPrice = parseFloat(b.price ?? '0')

    const aValue = aBalance * aPrice
    const bValue = bBalance * bPrice

    // 1. 优先按用户持有价值（balance * price）排序（降序）
    if (aValue !== bValue) return bValue - aValue

    // 2. 若持有价值相同或都为 0，则按后台配置的 weight 排序（降序）
    if (aValue === 0 && bValue === 0 && a.weight !== b.weight) {
      return b.weight - a.weight
    }

    // 3. 若价格相同，再按 balance 多者优先
    if (aPrice === bPrice && aBalance !== bBalance) {
      return bBalance - aBalance
    }

    // 默认保持稳定
    return 0
  })
}
