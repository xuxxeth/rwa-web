export function textPrefix(text: string, prefix: string) {
  return `${prefix}${text}`;
}

export function toFixed(value: number | string, precision = 2): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return `${(0).toFixed(precision)}`;
  }

  return num.toFixed(precision);
}

// 格式化百分比，保留两位小数
export function formatPercentage(
  value: string | number,
  precision = 2
): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return `${toFixed(0, precision)}%`;
  }

  return `${toFixed(num * 100, precision)}%`;
}

const units = [
  { threshold: 1e12, unit: "T", divisor: 1e12 },
  { threshold: 1e9, unit: "B", divisor: 1e9 },
  { threshold: 1e6, unit: "M", divisor: 1e6 },
  { threshold: 1e3, unit: "K", divisor: 1e3 },
];

export function formatLargeNumber(
  val: string | number,
  precision: number = 2
): string {
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : val;

  if (isNaN(num) || num === 0 || Object.is(num, -0))
    return (0).toFixed(precision);

  const matchedUnit = units.find((item) => num >= item.threshold) || {
    unit: "",
    divisor: 1,
  };

  let convertedValue = num / matchedUnit.divisor;

  // 动态进位处理
  if (convertedValue >= 999.995) {
    const upperUnit = units.find(
      (u) => u.divisor === matchedUnit.divisor * 1000
    );

    if (upperUnit) {
      convertedValue = convertedValue / 1e3;
      matchedUnit.unit = upperUnit.unit;
      matchedUnit.divisor = upperUnit.divisor;
    }
  }

  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: precision, // 强制保留最小小数位数
    maximumFractionDigits: precision, // 严格限制最大小数位数
  });

  return `${formatter.format(convertedValue)}${matchedUnit.unit}`;
}

export type Change = 0 | 1 | -1;
// 将一个字符串或者数字转换为 1, -1, 0
export function strOrNumToSign(val: string | number): Change {
  const numValue = typeof val === "string" ? parseFloat(val) : val;

  // 处理无效数值
  if (isNaN(numValue)) {
    return 0;
  }

  const rawSign = Math.sign(numValue);

  return Object.is(rawSign, -0) ? 0 : rawSign > 0 ? 1 : rawSign < 0 ? -1 : 0;
}

/**
 * 截断小数（不四舍五入）
 * @param value 要处理的数值
 * @param decimals 保留的小数位数
 */
export function truncate(value: number | string, decimals: number): string {
  const bn = new BigNumber(value);
  if (bn.isNaN()) return "0";
  return bn.decimalPlaces(decimals, BigNumber.ROUND_DOWN).toFixed(decimals);
}

/**
 * 股票代币价格显示：精确到后3位（截断）
 */
export function formatStockPrice(value: number | string): string {
  return truncate(value, 3);
}

/**
 * 股票 / Token 数量显示规则：
 * - 股票代币：精确到后4位
 * - 其他代币：
 *    - > 1 → 保留 2 位
 *    - 0.01 - 1 → 保留 4 位
 *    - < 0.01 → 保留 6 位
 */
export function formatTokenAmount(
  value: number | string,
  isStockToken = false
): string {
  const bn = new BigNumber(value);
  if (bn.isNaN()) return "0";

  if (isStockToken) return truncate(value, 4);

  const absVal = bn.abs();
  if (absVal.isGreaterThan(1)) return truncate(value, 2);
  if (absVal.isGreaterThan(0.01)) return truncate(value, 4);
  return truncate(value, 6);
}

/**
 * 千分位格式化
 * 例如：1234567.89 -> 1,234,567.89
 */
export function formatWithCommas(value: number | string, decimals?: number): string {
  if (value === null || value === undefined || value === "") return "0";
  const bn = new BigNumber(value);
  if (bn.isNaN()) return "0";
  const fixed = decimals != null ? bn.toFixed(decimals) : bn.toString();
  const [intPart, decPart] = fixed.split(".");
  return (
    intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    (decPart ? `.${decPart}` : "")
  );
}
