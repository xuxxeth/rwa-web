import { useBaseStore } from '@/stores/baseStore'
import BigNumber from 'bignumber.js'

/**
 * 平台收取的点差费用，可配置百分比，一期为千四
    计算规则：
    - 平台服务费 = 委托金额*配置百分比
    精度规则：
    - 四舍五入至小数点后两位
 */

export function calculatePlatformFee(amount: number | string, feeRate: number | string = 0.004): string {
  const fee = new BigNumber(amount)
    .multipliedBy(feeRate)
    .decimalPlaces(2, BigNumber.ROUND_HALF_UP) // 四舍五入至小数点后两位
  return fee.toFixed(2)
}

/** 
  交易活动费
  仅卖出时存在，每股配置费率，单笔订单最小收费和最大收费可配置。
  计算规则：
  - 交易活动费 = min(max(minFee, 委托数量 * feePerShare), maxFee)
  精度规则：
  - 四舍五入至小数点后两位
*/
export function calculateTradingActivityFee(
  quantity: number | string,
  feePerShare: number | string = '0.000166',
  minFee: number | string = '0.01',
  maxFee: number | string = '8.3'
): string {
  const feePerShareBN = new BigNumber(feePerShare)
  const minFeeBN = new BigNumber(minFee)
  const maxFeeBN = new BigNumber(maxFee)

  let fee = new BigNumber(quantity).multipliedBy(feePerShareBN)
  
  if (fee.isLessThan(minFeeBN)) {
    fee = minFeeBN
  } else if (fee.isGreaterThan(maxFeeBN)) {
    fee = maxFeeBN
  }

  return fee.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toFixed(2) // 四舍五入至小数点后两位
}

/**
 * 券商手续费

  券商基础交易佣金，每股配置费率，单笔订单最小收费可配置。
  计算规则：
  - 券商手续费=max(minFee, 委托数量 * feePerShare)
  精度规则：
  - 四舍五入至小数点后两位
 */
export function calculateBrokerageFee(
  quantity: number | string,
  feePerShare: number | string = '0.0035',
  minFee: number | string = '0.35'
): string {
  const feePerShareBN = new BigNumber(feePerShare)
  const minFeeBN = new BigNumber(minFee)

  let fee = new BigNumber(quantity).multipliedBy(feePerShareBN)
  
  if (fee.isLessThan(minFeeBN)) {
    fee = minFeeBN
  }

  return fee.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toFixed(2) // 四舍五入至小数点后两位
} 

/**
 * 预估交易费用
  计算规则：
  - 买入时：预估交易费用=券商手续费+平台服务费
  - 卖出时：预估交易费用=券商手续费+交易活动费+平台服务费
  精度规则：
  - 四舍五入至小数点后两位
 */

export function calculateEstimatedFee(
  amount: number | string, 
  quantity: number | string, 
  isBuy: boolean,
  platformFeeRate: number | string = 0.004,
  brokerageFeePerShare: number | string = '0.0035',
  brokerageMinFee: number | string = '0.35',
  tradingActivityFeePerShare: number | string = '0.000166',
  tradingActivityMinFee: number | string = '0.01',
  tradingActivityMaxFee: number | string = '8.3'
): string {
  const platformFee = new BigNumber(calculatePlatformFee(amount, platformFeeRate))
  const brokerageFee = new BigNumber(calculateBrokerageFee(quantity, brokerageFeePerShare, brokerageMinFee))
  let totalFee = platformFee.plus(brokerageFee)

  if (!isBuy) {
    const tradingActivityFee = new BigNumber(calculateTradingActivityFee(quantity, tradingActivityFeePerShare, tradingActivityMinFee, tradingActivityMaxFee))
    totalFee = totalFee.plus(tradingActivityFee)
  }

  return totalFee.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toFixed(2) // 四舍五入至小数点后两位
}

export function useCalcFee(
  orderValue: number | string = '0',
  quantity: number | string = '0',
  isBuy: boolean = true,
  feeRate?: string
) {
  const marketInfo = useBaseStore(state => state.marketInfo)
  
  // 从 marketInfo 中获取费用配置
  const commissionRate = marketInfo?.commissionRate || '0.0004'
  const minCommissionPerOrder = marketInfo?.minCommissionPerOrder || '0.35'
  const actionFeeRate = marketInfo?.actionFeeRate || '0.000166'
  const minActionFeePerOrder = marketInfo?.minActionFeePerOrder || '0.01'
  const maxActionFeePerOrder = marketInfo?.maxActionFeePerOrder || '8.3'
  
  const platformFee = calculatePlatformFee(orderValue, feeRate)
  const brokerageFee = calculateBrokerageFee(quantity, commissionRate, minCommissionPerOrder)
  const tradingActivityFee = isBuy ? '0' : calculateTradingActivityFee(quantity, actionFeeRate, minActionFeePerOrder, maxActionFeePerOrder)
  
  const estimatedFee = !quantity || Number(quantity) === 0 ? '0.00' : calculateEstimatedFee(orderValue, quantity, isBuy, feeRate, commissionRate, minCommissionPerOrder, actionFeeRate, minActionFeePerOrder, maxActionFeePerOrder)
  
  const value = new BigNumber(orderValue || 0);
  const fee = new BigNumber(estimatedFee || 0);

  const allOrderValue = isBuy ? value.plus(fee) : value.minus(fee);
  return {
    platformFee,
    brokerageFee,
    tradingActivityFee,
    estimatedFee,
    allOrderValue: allOrderValue.toString()
  }
}