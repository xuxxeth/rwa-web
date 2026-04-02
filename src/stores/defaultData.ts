
export const marketDefault = {
  "tradingStartTime": 0,
  "tradingEndTime": 0,
  "preMarketMinutes": 0,
  "afterMarketMinutes": 0,
  "actions": 0,
  "commissionRate": "0",
  "maxCommissionRate": "0",
  "minCommissionPerOrder": "0",
  "actionFeeRate": "0",
  "minActionFeePerOrder": "0",
  "maxActionFeePerOrder": "0",
  "networkFeeInNative": "0",
  "networkFeeInStable": "0",
  "timeInForce": 0,
  "validDate": 0,
  "slippage": "0.05" // 默认滑点容忍度
}

export const marketStateDefault = {
  "market": "", // us
  "desc": "",
  "tradingDayType": 1, // 0-非交易日，1-全天交易市，2-上半日市，3-下半日市
  "status": 7,
  "availability": {
    "trading": 0,
    "pre_after_trading": 0,
  }
}