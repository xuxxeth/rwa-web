// 0 市价单 1 限价单
export type OrderType = 0 | 1;
// 0 买单 1 卖单
export type OrderSide = 0 | 1;
// 0 等待提交 1 部分成交 2 下单失败（无成交） 3 撤单（无成交） 4 部分撤单  5 全部成交 6 废单 7 收市撤单（无成交）
export type OrderState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
// 0 未风控 1已风控
export type RiskState = 0 | 1;

export interface IOpenOrder {
  id: number;
  chainId: number;
  orderId: number;
  stockId: number;
  orderType: OrderType;
  side: OrderSide;
  validDate: number;
  amount: string;
  size: string;
  price: string;
  state: OrderState;
  settledAmount: string;
  settledSize: string;
  txTime: number;
  txHash: string;
  riskState: RiskState;
}

export interface IOrder {
  id: number;
  orderId: number;
  chainId: number;
  stockId: number;
  orderType: OrderType;
  side: OrderSide;
  validDate: number;
  // 委托金额
  amount: string;
  // 委托数量
  size: string;
  // 委托价格
  price: string;
  // 订单状态
  state: OrderState;
  // 成交金额
  settledAmount: string;
  // 成交数量
  settledSize: string;
  riskState: RiskState;
  txTime: number;
  txHash: string;
}

export interface ITrade {
  // 成交金额
  amount: string;
  chainId: number;
  id: number;
  orderId: number;
  orderType: OrderType;
  side: OrderSide;
  // 成交数量
  size: string;
  stockId: number;
  txHash: string;
  txTime: number;
}
