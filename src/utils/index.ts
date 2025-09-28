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
