
export interface IStockActionEvent {
  id: number,
  chainId: number,
  businessType: number // 业务类型：1-拆并股
  stockId: number,
  exchangeStartTime: number,
  exchangeEndTime: number,
  showStatus: number, // 0-未开启，1-进行中
  payinAmount: number, // 兑换比例旧token数量
  payinAddress: string,
  payoutAmount: number,
  payoutAddress: string,
  fractionalSharesAvgPrice: number,
  paymentAddress: string,
  exchangeStatus: number // 合约兑换状态：0-关闭，1-开启
}

export interface IStockActionEventData {
  list: IStockActionEvent[],
  pageNum: number,
  pageSize: number,
  total: number
}