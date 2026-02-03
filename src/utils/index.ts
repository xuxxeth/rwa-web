import BigNumber from 'bignumber.js'

export * from './tw'
export * from './sort'
export * from './format'

export function shortenAddress(address: string, startLength = 4, endLength = 4): string {
  if (!address) return ''
  if (address.length <= startLength + endLength) return address // 地址太短直接返回
  return `${address.slice(0, startLength + 2)}...${address.slice(-endLength)}`
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function noop() {}

export function parseAmount(value: string | number, decimals: number = 6): string {
  return new BigNumber(value)
    .multipliedBy(new BigNumber(10).pow(decimals)) // 放大 10^decimals
    .integerValue(BigNumber.ROUND_DOWN) // 转整数，避免小数
    .toFixed(0) // 输出字符串
}

export function formatAmount(
  value: string | number | bigint,
  decimals: number = 6,
  precision: number = decimals
): string {
  return new BigNumber(value.toString())
    .dividedBy(new BigNumber(10).pow(decimals)) // 除以 10^decimals
    .toFixed(precision, BigNumber.ROUND_DOWN) // 保留指定小数位
}

export function multiply(num1: string | number, num2: string | number) {
  if (!num1 || !num2 || num1 === '0' || num2 === '0') return '0'
  if (num1 === '1') return String(num2)
  if (num2 === '1') return String(num1)

  // 使用BigNumber库处理乘法，确保小数和大数计算的准确性
  try {
    const result = new BigNumber(num1).multipliedBy(new BigNumber(num2))
    return result.toString()
  } catch (error) {
    console.error('乘法计算错误:', error)
    return '0'
  }
}

export function divide(num1: string | number, num2: string | number) {
  if (!num1 || !num2 || num2 === '0') return '0'
  if (num1 === '0') return '0'
  if (num2 === '1') return String(num1)

  // 使用BigNumber库处理除法，确保小数和大数计算的准确性
  try {
    const result = new BigNumber(num1).dividedBy(new BigNumber(num2))
    return result.toString()
  } catch (error) {
    console.error('除法计算错误:', error)
    return '0'
  }
}

export function subtract(num1: string | number, num2: string | number) {
  if (!num1 || !num2 || num1 === '0') return String(num2)
  if (num2 === '0') return String(num1)

  // 使用BigNumber库处理减法，确保小数和大数计算的准确性
  try {
    const result = new BigNumber(num1).minus(new BigNumber(num2))
    return result.toString()
  } catch (error) {
    console.error('减法计算错误:', error)
    return '0'
  }
}

export function sum(...numbers: (string | number)[]) {
  // 边界情况处理：如果没有输入数字或所有数字都是0，则返回"0"
  if (numbers.length === 0) return '0'

  try {
    // 使用BigNumber累加所有数字
    let total = new BigNumber(0)

    for (const num of numbers) {
      // 跳过空值或无效值
      if (num === null || num === undefined || num === '' || num === '0') continue

      total = total.plus(new BigNumber(num))
    }

    return total.toString()
  } catch (error) {
    console.error('加法计算错误:', error)
    return '0'
  }
}
// 返回当前时间距零点的秒数
export function getSecondsSinceMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(0, 0, 0, 0)
  const diffMs = now.getTime() - midnight.getTime()
  return Math.floor(diffMs / 1000)
}

export function checkSymbolEqual(symbol1: string, symbol2: string) {
  return symbol1.toLowerCase() === symbol2.toLowerCase()
}

export function symbolToLower(symbol: string) {
  return symbol.toLowerCase()
}

export function fuzzySearch(text: string, searchText: string) {
  if (!text || !searchText) return false
  return text.toLowerCase().includes(searchText.toLowerCase())
}

export function getEasternSecondsSinceMidnight() {
  const now = new Date()
  const estString = now.toLocaleString('en-US', { timeZone: 'America/New_York' })
  const estDate = new Date(estString)

  const midnight = new Date(estDate)
  midnight.setHours(0, 0, 0, 0)

  const diffMs = estDate.getTime() - midnight.getTime()
  return Math.floor(diffMs / 1000) // 秒数
}

export function openUrlInNewWindow(url: string) {
  if (!url || typeof url !== 'string') {
    console.warn('openUrlInNewWindow: Invalid URL provided')
    return null
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function formatToQuarterLabel(dateStr: string | number) {
  const year = Number(String(dateStr).slice(0, 4))
  const month = Number(String(dateStr).slice(4, 6))

  let quarter = 1
  if (month >= 4 && month <= 6) quarter = 2
  else if (month >= 7 && month <= 9) quarter = 3
  else if (month >= 10 && month <= 12) quarter = 4

  return `Q${quarter} ${String(year)}`
}

export const TEN_MINUTES = 10 * 60 * 1000
export const ONE_MINUTE = 60 * 1000
export const TEN_SECONDS = 10 * 1000

export async function mergeTwoImageFromUrls(url1: string, url2: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const image1 = new Image()
    const image2 = new Image()

    let loadedCount = 0
    const onImageLoad = () => {
      loadedCount++
      if (loadedCount === 2) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          return reject(new Error('Failed to get canvas 2D context'))
        }

        // 以上下排列
        const maxWidth = Math.max(image1.width, image2.width)
        const totalHeight = image1.height + image2.height
        canvas.width = maxWidth
        canvas.height = totalHeight

        // 绘制图片
        ctx.drawImage(image1, 0, 0)
        ctx.drawImage(image2, 0, image1.height)

        canvas.toBlob(
          blob => {
            if (blob) {
              // jpeg 能以更小的文件体积保留可接受的图像质量
              const mergedFile = new File([blob], 'merged-image.jpg', { type: 'image/jpeg' })
              resolve(mergedFile)
            } else {
              reject(new Error('Failed to convert Canvas to Blob'))
            }
          },
          'image/jpeg',
          0.8
        ) // 添加质量参数 0.8
      }
    }

    image1.onerror = () => reject(new Error(`Failed to load image 1: ${url1}`))
    image2.onerror = () => reject(new Error(`Failed to load image 2: ${url2}`))

    image1.onload = onImageLoad
    image2.onload = onImageLoad

    // 使用 fetch 加载图片，并设置为 no-cache，强制浏览器重新发起带 Origin 的请求
    // 从而避免使用之前缓存的"无 CORS 头"响应
    const loadBlobImage = async (url: string, img: HTMLImageElement) => {
      // 1. 如果是 Blob URL (本地预览图)，直接加载，无需 fetch
      if (url.startsWith('blob:')) {
        img.src = url
        return
      }

      // 2. 如果是s3 url, 使用 fetch + no-cache 绕过 CORS 缓存
      try {
        const response = await fetch(url, { mode: 'cors', cache: 'no-cache' })
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        img.src = objectUrl
      } catch (err) {
        // 如果 fetch 失败，尝试回退到普通加载（可能仍然会失败，但值得一试）
        console.warn('Fetch image failed, fallback to direct src', err)
        img.crossOrigin = 'anonymous'
        img.src = url
      }
    }

    loadBlobImage(url1, image1)
    loadBlobImage(url2, image2)
  })
}
