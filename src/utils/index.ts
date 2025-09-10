
export * from './tw'

export function shortenAddress(address: string, startLength = 4, endLength = 4): string {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address; // 地址太短直接返回
  return `${address.slice(0, startLength + 2)}...${address.slice(-endLength)}`;
}