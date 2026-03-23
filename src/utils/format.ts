import BigNumber from 'bignumber.js'
import prettyMs from 'pretty-ms'
import { multiply, subtract, divide } from './index'

export function textPrefix(text: string, prefix: string) {
  return `${prefix}${text}`
}

export function textSuffix(text: string, suffix: string, spaceCount: number = 1) {
  const spaces = ' '.repeat(Math.max(0, spaceCount))
  return `${text}${spaces}${suffix}`
}

/**
 * 使用 BigNumber 进行四舍五入，解决 JS 浮点数精度问题
 * 例如：1.335.toFixed(2) 在 JS 中是 '1.33'，使用 BigNumber 后为 '1.34'
 * @param value 数值
 * @param precision 小数位数，默认 2
 */
export function toFixed(value: number | string, precision = 2): string {
  if (value === null || value === undefined || value === '') {
    return new BigNumber(0).toFixed(precision)
  }

  const num = new BigNumber(value)

  if (num.isNaN()) {
    return new BigNumber(0).toFixed(precision)
  }

  return num.toFixed(precision, BigNumber.ROUND_HALF_UP)
}

// 格式化百分比，保留两位小数
export function formatPercentage(value: string | number, precision = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) {
    return `${toFixed(0, precision)}%`
  }

  return `${toFixed(num * 100, precision)}%`
}

const units = [
  { threshold: 1e12, unit: 'T', divisor: 1e12 },
  { threshold: 1e9, unit: 'B', divisor: 1e9 },
  { threshold: 1e6, unit: 'M', divisor: 1e6 },
  { threshold: 1e3, unit: 'K', divisor: 1e3 },
]

export function formatLargeNumber(val: string | number, precision: number = 2): string {
  if (val == null || val === '') return (0).toFixed(precision)

  // 转数字
  let num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val
  if (isNaN(num)) return (0).toFixed(precision)

  // 处理负数：记录符号
  const sign = num < 0 ? '-' : ''
  num = Math.abs(num)

  if (num === 0) return (0).toFixed(precision)

  // 匹配单位
  const matchedUnit = units.find(item => num >= item.threshold) || { unit: '', divisor: 1 }

  let convertedValue = num / matchedUnit.divisor

  // 动态进位处理，例如 999.995K → 1.00M
  if (convertedValue >= 999.995) {
    const upperUnit = units.find(u => u.divisor === matchedUnit.divisor * 1000)
    if (upperUnit) {
      convertedValue = convertedValue / 1e3
      matchedUnit.unit = upperUnit.unit
      matchedUnit.divisor = upperUnit.divisor
    }
  }

  // 格式化数值
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })

  return `${sign}${formatter.format(convertedValue)}${matchedUnit.unit}`
}

export type Change = 0 | 1 | -1
// 将一个字符串或者数字转换为 1, -1, 0
export function strOrNumToSign(val: string | number): Change {
  const numValue = typeof val === 'string' ? parseFloat(val) : val

  // 处理无效数值
  if (isNaN(numValue)) {
    return 0
  }

  const rawSign = Math.sign(numValue)

  return Object.is(rawSign, -0) ? 0 : rawSign > 0 ? 1 : rawSign < 0 ? -1 : 0
}

/**
 * 截断小数（不四舍五入）
 * @param value 要处理的数值
 * @param decimals 保留的小数位数
 */
export function truncate(value: number | string, decimals: number): string {
  const bn = new BigNumber(value)
  if (bn.isNaN()) return '0'
  return bn.decimalPlaces(decimals, BigNumber.ROUND_DOWN).toFixed(decimals)
}

/**
 * 小数，向上入
 * @param value 要处理的数值
 * @param decimals 保留的小数位数
 */
export function truncateUP(value: number | string, decimals: number): string {
  const bn = new BigNumber(value)
  if (bn.isNaN()) return '0'
  return bn.decimalPlaces(decimals, BigNumber.ROUND_UP).toFixed(decimals)
}

/**
 * 股票代币价格显示：精确到后3位（截断）
 */
export function formatStockPrice(value: number | string): string {
  return truncate(value, 3)
}

export function formatUp(up: string | undefined) {
  const change = strOrNumToSign(up || 0)
  if (up === undefined) return ''
  return `${textPrefix(textSuffix(up, '%'), change === 1 ? '+' : '')}`
}

export function calculateUp(price1: number, price2: number) {
  return toFixed(multiply(subtract(divide(price1, price2), 1), 100), 2)
}

export function getUpColor(change: Change) {
  switch (change) {
    case 0: {
      return 'text-gray-400'
    }
    case 1: {
      return 'text-green-50'
    }
    case -1: {
      return 'text-red-50'
    }
    default: {
      return 'text-gray-400'
    }
  }
}

/**
 * 股票 / Token 数量显示规则：
 * - 股票代币：精确到后4位
 * - 其他代币：
 *    - > 1 → 保留 2 位
 *    - 0.01 - 1 → 保留 4 位
 *    - < 0.01 → 保留 6 位
 */
export function formatTokenAmount(value: number | string, isStockToken = false): string {
  const bn = new BigNumber(value)
  if (bn.isNaN()) return '0'

  if (isStockToken) return truncate(value, 4)

  const absVal = bn.abs()
  if (absVal.isGreaterThan(1)) return truncate(value, 2)
  if (absVal.isGreaterThan(0.01)) return truncate(value, 4)
  return truncate(value, 6)
}

/**
 * 千分位格式化
 * 例如：1234567.89 -> 1,234,567.89
 */
export function formatWithCommas(value: number | string, decimals?: number): string {
  if (value === null || value === undefined || value === '') return '0'
  const bn = new BigNumber(value)
  if (bn.isNaN()) return '0'
  const fixed = decimals != null ? bn.toFixed(decimals) : bn.toString()
  const [intPart, decPart] = fixed.split('.')
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (decPart ? `.${decPart}` : '')
}

export function formatTokenAmountWithCommas(value: number | string, decimals?: number): string {
  return formatWithCommas(formatTokenAmount(value), decimals)
}
export function formatNumberWithCommas(value: number | string, decimal = 2): string {
  const num = Number(value)
  if (isNaN(num)) return String(value)

  return num
    .toFixed(decimal) // 先保留 decimal 位
    .replace(/\.?0+$/, '') // 去掉末尾多余的 0 和小数点
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',') // 千分位
}

export function formatTimestamp(seconds: number): string {
  const formatter = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // 使用24小时制
  })

  const date = new Date(seconds * 1000)

  const parts = formatter.formatToParts(date)

  // 提取年、月、日、时、分、秒
  let year = ''
  let month = ''
  let day = ''
  let hour = ''
  let minute = ''
  let second = ''

  parts.forEach(part => {
    switch (part.type) {
      case 'year':
        year = part.value
        break
      case 'month':
        month = part.value
        break
      case 'day':
        day = part.value
        break
      case 'hour':
        hour = part.value
        break
      case 'minute':
        minute = part.value
        break
      case 'second':
        second = part.value
        break
    }
  })

  return `${year}/${month}/${day} ${hour}:${minute}:${second}`
}

export function readableDuration(seconds: number) {
  if (typeof seconds !== 'number' || isNaN(seconds) || !isFinite(seconds)) {
    return '0s'
  }

  return prettyMs(seconds * 1000, {
    verbose: true,
  })
}

export function compareBigNumber(a: string | number, b: string | number): -1 | 0 | 1 {
  const numA = new BigNumber(a)
  const numB = new BigNumber(b)
  console.log(a, b)
  if (numA.isLessThan(numB)) return -1
  if (numA.isGreaterThan(numB)) return 1
  return 0
}

function toBN(value: string | number | BigNumber | bigint): BigNumber {
  return new BigNumber(value ?? 0)
}

/** 是否相等 */
export function isEqual(a: string | number | BigNumber, b: string | number | BigNumber): boolean {
  return toBN(a).isEqualTo(toBN(b))
}

/** 是否大于 */
export function isGreater(a: string | number | BigNumber, b: string | number | BigNumber): boolean {
  return toBN(a).isGreaterThan(toBN(b))
}

/** 是否大于等于 */
export function isGreaterOrEqual(
  a: string | number | BigNumber,
  b: string | number | BigNumber
): boolean {
  return toBN(a).isGreaterThanOrEqualTo(toBN(b))
}

/** 是否小于 */
export function isLess(
  a: string | number | BigNumber | bigint,
  b: string | number | BigNumber | bigint
): boolean {
  return toBN(a).isLessThan(toBN(b))
}

/** 是否小于等于 */
export function isLessOrEqual(
  a: string | number | BigNumber,
  b: string | number | BigNumber
): boolean {
  return toBN(a).isLessThanOrEqualTo(toBN(b))
}

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function formatDateToShortEN(dateStr: string): string {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''

  const day = date.getDate()
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month}, ${year}`
}

export function formatSecondsToDateTime(sec: string | number) {
  const seconds = Number(sec)
  if (!seconds && seconds !== 0) return ''

  const date = new Date(seconds * 1000) // 将秒转换为毫秒

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // 月份从0开始
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}
