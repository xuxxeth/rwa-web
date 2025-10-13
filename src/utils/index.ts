import BigNumber from "bignumber.js";

export * from "./tw";
export * from "./sort";
export * from "./format";

export function shortenAddress(
  address: string,
  startLength = 4,
  endLength = 4
): string {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address; // 地址太短直接返回
  return `${address.slice(0, startLength + 2)}...${address.slice(-endLength)}`;
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function noop() {}

export function parseAmount(
  value: string | number,
  decimals: number = 6
): string {
  return new BigNumber(value)
    .multipliedBy(new BigNumber(10).pow(decimals)) // 放大 10^decimals
    .integerValue(BigNumber.ROUND_DOWN) // 转整数，避免小数
    .toFixed(0); // 输出字符串
}

export function formatAmount(
  value: string | number | bigint,
  decimals: number = 6,
  precision: number = decimals
): string {
  return new BigNumber(value.toString())
    .dividedBy(new BigNumber(10).pow(decimals)) // 除以 10^decimals
    .toFixed(precision, BigNumber.ROUND_DOWN); // 保留指定小数位
}

export function multiply(num1: string | number, num2: string | number) {
  if (!num1 || !num2 || num1 === "0" || num2 === "0") return "0";
  if (num1 === "1") return String(num2);
  if (num2 === "1") return String(num1);

  // 使用BigNumber库处理乘法，确保小数和大数计算的准确性
  try {
    const result = new BigNumber(num1).multipliedBy(new BigNumber(num2));
    return result.toString();
  } catch (error) {
    console.error("乘法计算错误:", error);
    return '0';
  }
}

export function divide(num1: string | number, num2: string | number) {
  if (!num1 || !num2 || num2 === "0") return "0";
  if (num1 === "0") return "0";
  if (num2 === "1") return String(num1);

  // 使用BigNumber库处理除法，确保小数和大数计算的准确性
  try {
    const result = new BigNumber(num1).dividedBy(new BigNumber(num2));
    return result.toString();
  } catch (error) {
    console.error("除法计算错误:", error);
    return '0';
  }
}

export function sum(...numbers: (string | number)[]) {
  // 边界情况处理：如果没有输入数字或所有数字都是0，则返回"0"
  if (numbers.length === 0) return "0";

  try {
    // 使用BigNumber累加所有数字
    let total = new BigNumber(0);

    for (const num of numbers) {
      // 跳过空值或无效值
      if (num === null || num === undefined || num === "" || num === "0")
        continue;

      total = total.plus(new BigNumber(num));
    }

    return total.toString();
  } catch (error) {
    console.error("加法计算错误:", error);
    return '0';
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

export function getEasternSecondsSinceMidnight() {
  const now = new Date();
  const estString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const estDate = new Date(estString);

  const midnight = new Date(estDate);
  midnight.setHours(0, 0, 0, 0);

  const diffMs = estDate.getTime() - midnight.getTime();
  return Math.floor(diffMs / 1000); // 秒数
}