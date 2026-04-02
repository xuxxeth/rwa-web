// 0 限价单 1 市价单
export type OrderType = 0 | 1
// 0 买单 1 卖单
export type OrderSide = 0 | 1
// 0 待提交 1 部分成交 2 下单失败（无成交） 3 已撤销  5 全部成交 8 待撤单 9 待成交
export type OrderState = 0 | 1 | 2 | 3 | 5 | 8 | 9
// 0 未风控 1 已风控
export type RiskType = 0 | 1

// 0 Day(当日有效) 1 GTD(指定日期有效) 2 GTC(一直有效)
export type Tif = 0 | 1 | 2

export type Reason = 0 | 1 | 2 | 3

// 0 仅盘中 4 盘前+盘后
export type SessionType = 0 | 4

export interface IOpenOrder {
  id: string
  chainId: number
  orderId: string
  stockId: number
  orderType: OrderType
  tif: Tif
  side: OrderSide
  validDate: number
  amount: string
  size: string
  price: string
  state: OrderState
  settledAmount: string
  settledSize: string
  txTime: number
  txHash: string
  reason: Reason
  currency: string
  sessionType: SessionType
}

export interface IOrder {
  id: string
  orderId: string
  chainId: number
  stockId: number
  orderType: OrderType
  side: OrderSide
  tif: Tif
  validDate: number
  // 委托金额
  amount: string
  // 委托数量
  size: string
  // 委托价格
  price: string
  // 订单状态
  state: OrderState
  // 成交金额
  settledAmount: string
  // 成交数量
  settledSize: string
  reason: Reason
  txTime: number
  tradeTime: number
  txHash: string
  currency: string
  commission: string
  fee: string
  sessionType: SessionType
}

export interface ITrade {
  // 成交金额
  amount: string
  chainId: number
  id: string
  orderId: string
  orderType: OrderType
  side: OrderSide
  // 成交数量
  size: string
  stockId: number
  txHash: string
  txTime: number
  reason: Reason
  currency: string
}
