
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

export interface ITokenWithBalance {
  "origin"?: string,
  "balance"?: string,
}

export interface ITokenWithPrice  {
  "price"?: string , 
  "up"?: string, 
}

export interface IStockWithPrice {
  "price"?: string , 
  "up"?: string, 
  "cPrice"?: string, 
}

// 股票信息
export interface IStock {
  "id": number,
  "stockCode": string,
  "stockName": string,
  "icon": string,
  "state": number,
  "weight": number,
  "price"?: string , 
  "up"?: string, 
  "cPrice"?: string, 
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

export interface IRwaPrice {
  "S": string,          // 股票编号    
  "p": number,  // 最新价
  "o": number,  // 今开价
  "l": number,  // 最低价
  "h": number,  // 最高价
  "c": number,  // 当日收盘价
  "pc": number, // 昨日收盘价
  "T": number  // 时间戳(秒)
}
