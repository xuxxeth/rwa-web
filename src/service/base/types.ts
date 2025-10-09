
// 链基础信息
export interface IChain {
  "id": number,
  "name": string,
  "state": number, // 状态：0-不可用，1-可用
  "contract": string,
  "icon": string,
  "nativeToken": string,
  "rpc": string,
  "scan": string
}

// 股票信息
export interface IStocks {
  "id": number,
  "stockCode": string,
  "stockName": string,
  "icon": string,
  "state": number,
  "weight": number
}
// token信息
export interface IToken {
  "chainId": 1,
  "address": string,
  "symbol": string,
  "name": string,
  "icon": string,
  "decimals": number,
  "precision": number,
  "state": number,    // 状态：0-下架，1-上架
  "balance"?: string,
  "origin"?: string
}
// RWA基础信息
export interface IRwa {
  "id": number,
  "stockId": number,
  "chainId": number,
  "address": string,
  "decimals": number,
  "symbol": string,
  "name": string,
  "icon": string,
  "feeRate": string,
  "minLimitTradeAmount": string,
  "maxLimitTradeAmount": string,
  "minMarketTradeAmount": string,
  "maxMarketTradeAmount": string
  "tokens": string[],
  "precision": number,
  "state": number,
  "weight": number,
  "balance"?: string,
  "origin"?: string,
  "price"?: string , 
  "up"?: string, 
  "lock"?: number, 
}

// 市场信息
export interface IMarket {
  "tradingStartTime": number,
  "tradingEndTime": number,
  "preMarketMinutes": number,
  "afterMarketMinutes": number,
  "actions": number,
  "commissionRate": string,
  "maxCommissionRate": string,
  "minCommissionPerOrder": string,
  "actionFeeRate": string,
  "minActionFeePerOrder": string,
  "maxActionFeePerOrder": string,
  "networkFeeInNative": string,
  "networkFeeInStable": string
  "timeInForce": number,
  "validDate": number
}
// 券商状态信息
export interface IMarketState {
  "market": string,
  "desc": string,
  "tradingDayType": number,
  "status": number
}
