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

  return (
    (order === 'asc' ? 1 : -1) *
    String(a).localeCompare(String(b), i18n.language, {
      numeric: options.numeric,
      sensitivity: options.sensitivity || 'variant',
    })
  )
}
