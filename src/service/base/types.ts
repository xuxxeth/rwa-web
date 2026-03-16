
// 链基础信息
export interface IChain {
  "id": number,
  "name": string,
  "displayName": string,
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
  "dailyHigh"?: string,
}

// 0-正常，1-禁止买卖, 2-下架
export type IRwaState = 0 | 1 | 2

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
  "state": IRwaState,
  "weight": number,
  "stockStatistics": {
    "totalShare": number,
    "circShare": number
  }
}

export type IRwaWithBalancePrice = IRwa & ITokenWithBalance & ITokenWithPrice

// 市场信息
export interface IMarket {
  "tradingStartTime": number,
  "tradingEndTime": number,
  "preMarketMinutes": number,
  "afterMarketMinutes": number,
  "actions": number,
  "commissionRate": string, // 交易费率
  "maxCommissionRate": string, // 最大交易费率
  "minCommissionPerOrder": string, // 每笔订单最小交易费
  "actionFeeRate": string, // 活动费率
  "minActionFeePerOrder": string, // 每笔订单最小活动费
  "maxActionFeePerOrder": string, // 每笔订单最大活动费
  "networkFeeInNative": string, // 原生代币网络费
  "networkFeeInStable": string // 稳定币网络费
  "timeInForce": number,
  "validDate": number,
  "slippage": string, // 默认滑点容忍度
}
// 券商状态信息
/**
 * tradingDayType： 4-美股全日市 5-美股上半日市 6-美股下半日市 7-新股全日市 8-新股上半日市 9-新股下半日市 10-美股期权全日市 11-美股期权上半日市 12- 美股期权下半日）
 * status: 0-未开盘 1-港股早盘竞价 2- 美股/期权盘前交易 3-交易中 4-午间休市 5-港股收 市竞价 6-美股/期权盘后交易 7-已收盘 8-新股开市 前交易 9-新股收市前交易 10-新股收盘交易 11-A 股通待开盘 12-美股夜盘 13-全球交易时段 14-场 外交易
 * 
 *  trading: 第一位LimitOrder,第二位MarketOrder
    0-00: 都不能交易
    1-01: 限价单不可交易，市价单可交易
    2-10: 限价单可交易，市价单不可交易
    3-11: 限价单、市价单均可交易
    pre_after_trading
    第一位LimitOrder,第二位MarketOrder
    0-00: 都不能交易
    1-01: 限价单不可交易，市价单可交易
    2-10: 限价单可交易，市价单不可交易
    3-11: 限价单、市价单均可交易

 */
export interface IMarketState {
  "market": string,
  "desc": string,
  "tradingDayType": number,
  "status": number,
  "availability": {
   "trading": number,
   "pre_after_trading": number, 
  }
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

export interface IStatistic {
  "stockId": number,
  "marketCap": number,
  "totalShare": number,
  "circShare": number,
  "netIncomeLtm": number,
  "netIncomeLastYear": number,
  "netAsset": number,
  "onchainAddr": string,
  "eps": string,
  "epsTtm": string
}

export interface IToptenshareholder {
  "investor": string,
  "heldSharesVolume": number,
  "proportion": number,
  "shareHoldingChange": number
}

export interface IProfile {
  "stockId": number,
  "companyName": string,
  "listingDate": string,
  "industry": string,
  "chairman": string,
  "introduction": string,
  "topTenShareholders": IToptenshareholder[]
}

export interface IIndicators {
  "report_period": number,
  "year": number,
  "crncy_code": number,
  "roa_annual": number,
  "roe_annual": number,
  "pe_annual": number,
  "pb_annual": number,
  "eps_annual": number,
  "bps_annual": number,
  "ocfps_annual": number,
  "grps_annual": number,
  "roa_annual_yoy": number,
  "roe_annual_yoy": number,
  "pe_annual_yoy": number,
  "pb_annual_yoy": number,
  "eps_annual_yoy": number,
  "bps_annual_yoy": number,
  "ocfps_annual_yoy": number,
  "grps_annual_yoy": number
}
