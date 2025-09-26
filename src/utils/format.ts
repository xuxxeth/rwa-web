export function textPrefix(text: string, prefix: string) {
  return `${prefix}${text}`;
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

// 格式化百分比，保留两位小数
export function formatPercentage(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return "0.00%";
  }

  // 处理边界值
  const fixedValue = (num * 100).toFixed(2);

  return `${fixedValue}%`;
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
