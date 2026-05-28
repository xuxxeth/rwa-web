import { useBaseStore } from '@/stores/baseStore'
import BigNumber from 'bignumber.js'
import { FeeMode, useMarket, type FeeItem } from 'ca-common-web'
import { useEffect, useMemo } from 'react'
import { useActiveWeb3 } from './useActiveWe3'
import type { Address } from '@/config/constants'
import { useTradeStore } from '@/stores/tradeStore'

export function formatFeeRate(
  value: BigNumber.Value,
  scale = FEE_RATE_SCALE_8
): string {
  return new BigNumber(value)
    .dividedBy(scale)
    .toFixed()
    .replace(/\.?0+$/, '')
}

export function calcFeeRateValue(feeItem: FeeItem) {
  let value = '0.00'
  let minValue = '0.00'
  let maxValue = '0.00'
  if (feeItem.mode === FeeMode.FIXED_FEE) {
    value = formatFeeRate(feeItem.value, FEE_RATE_SCALE_6) // 固定费用，单位为万分比
  }
  if (feeItem.minMode === FeeMode.FIXED_FEE) {
    minValue = formatFeeRate(feeItem.minValue, FEE_RATE_SCALE_6) // 固定费用，单位为万分比
  }
  if (feeItem.maxMode === FeeMode.FIXED_FEE) {
    maxValue = formatFeeRate(feeItem.maxValue, FEE_RATE_SCALE_6) // 固定费用，单位为万分比
  }
  if (feeItem.mode === FeeMode.AMOUNT_RATIO || feeItem.mode === FeeMode.PER_SHARE) {
    value = formatFeeRate(feeItem.value, FEE_RATE_SCALE_6) + '%' // 固定费用，单位为万分比
  }
  if (feeItem.minMode === FeeMode.AMOUNT_RATIO || feeItem.minMode === FeeMode.PER_SHARE) {
    minValue = formatFeeRate(feeItem.minValue, FEE_RATE_SCALE_6) + '%' // 固定费用，单位为万分比
  }
  if (feeItem.maxMode === FeeMode.AMOUNT_RATIO || feeItem.maxMode === FeeMode.PER_SHARE) {
    maxValue = formatFeeRate(feeItem.maxValue, FEE_RATE_SCALE_6) + '%' // 固定费用，单位为万分比
  }

  
  return {
    value,
    minValue,
    maxValue
  }
}

// 获取合约费用

export function useFetchFeeConfig() {
  const { chainId } = useActiveWeb3()
  const setFeeConfig = useTradeStore(state => state.setFeeConfig)
  const chainList = useBaseStore(state => state.chainList)

  const trading = useMemo(() => {
    const chain = chainList.find(chain => chain.id === chainId)
    return chain?.contract as Address
  }, [chainId, chainList])

  const { getFeeConfig } = useMarket(trading)
  const defaultFeeRate = { value: '0.00', minValue: '0.00', maxValue: '0.00', noFee: true }
  useEffect(() => {
    const fetchFeeConfig = async () => {
      try {
        const feeConfig = await getFeeConfig()
        
        if (feeConfig) {
          const platformFeeRate = formatFeeRate(feeConfig.platformFee, FEE_RATE_SCALE_8)
          const buyRuleId1FeeItem = feeConfig.buyFeeConfigs.find((item: FeeItem) => item.ruleId === 1)
          const buyRuleId2FeeItem = feeConfig.buyFeeConfigs.find((item: FeeItem) => item.ruleId === 2)
          const buyRuleId3FeeItem = feeConfig.buyFeeConfigs.find((item: FeeItem) => item.ruleId === 3)
          const buyRuleId4FeeItem = feeConfig.buyFeeConfigs.find((item: FeeItem) => item.ruleId === 4)

          const buyFeeRate = {
            platformFeeRate: { value: platformFeeRate, minValue: '0.00', maxValue: '0.00' },
            brokerageFeeRate: buyRuleId1FeeItem ? calcFeeRateValue(buyRuleId1FeeItem) : defaultFeeRate,
            tradingActivityFeeRate: buyRuleId2FeeItem ? calcFeeRateValue(buyRuleId2FeeItem) : defaultFeeRate,
            secFeeRate: buyRuleId3FeeItem ? calcFeeRateValue(buyRuleId3FeeItem) : defaultFeeRate,
            catFeeRate: buyRuleId4FeeItem ? calcFeeRateValue(buyRuleId4FeeItem) : defaultFeeRate
          }

          const sellRuleId1FeeItem = feeConfig.sellFeeConfigs.find((item: FeeItem) => item.ruleId === 1)
          const sellRuleId2FeeItem = feeConfig.sellFeeConfigs.find((item: FeeItem) => item.ruleId === 2)
          const sellRuleId3FeeItem = feeConfig.sellFeeConfigs.find((item: FeeItem) => item.ruleId === 3)
          const sellRuleId4FeeItem = feeConfig.sellFeeConfigs.find((item: FeeItem) => item.ruleId === 4)
          const sellFeeRate = {
            platformFeeRate: { value: platformFeeRate, minValue: '0.00', maxValue: '0.00' },
            brokerageFeeRate: sellRuleId1FeeItem ? calcFeeRateValue(sellRuleId1FeeItem) : defaultFeeRate,
            tradingActivityFeeRate: sellRuleId2FeeItem ? calcFeeRateValue(sellRuleId2FeeItem) : defaultFeeRate,
            secFeeRate: sellRuleId3FeeItem ? calcFeeRateValue(sellRuleId3FeeItem) : defaultFeeRate,
            catFeeRate: sellRuleId4FeeItem ? calcFeeRateValue(sellRuleId4FeeItem) : defaultFeeRate
          }

          setFeeConfig({...feeConfig, buyFeeRate: buyFeeRate, sellFeeRate: sellFeeRate})
        }
        
        
      } catch (error) {
        console.error('Failed to fetch fee config:', error)
      }
    }
    fetchFeeConfig()
  }, [getFeeConfig])
}

/**
 * 平台收取的点差费用，可配置百分比，一期为千四
    计算规则：
      })
      .catch((error) => {
        console.error('Failed to fetch fee config:', error)
      })
  }, [])
}

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
    .dividedBy(FEE_RATE_SCALE_8)
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

  // const feeConfig = useTradeStore(state => state.feeConfig)
  // console.log('feeConfig from store:', feeConfig)

  const platformFee = new BigNumber(calculatePlatformFee(amount, platformFeeRate))
  const brokerageFee = new BigNumber(calculateBrokerageFee(quantity, brokerageFeePerShare, brokerageMinFee))
  let totalFee = platformFee.plus(brokerageFee)

  if (!isBuy) {
    const tradingActivityFee = new BigNumber(calculateTradingActivityFee(quantity, tradingActivityFeePerShare, tradingActivityMinFee, tradingActivityMaxFee))
    totalFee = totalFee.plus(tradingActivityFee)
  }

  return totalFee.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toFixed(2) // 四舍五入至小数点后两位
}


export const FEE_RATE_SCALE_6 = 1000000 // 万分比
export const FEE_RATE_SCALE_8 = 100000000 // 亿分比

export function calcFeeByMode(mode: FeeMode, value: number, orderValue: number | string, quantity: number | string = 0) {
  if (mode === FeeMode.FIXED_FEE) {
    return new BigNumber(Number(value)).dividedBy(FEE_RATE_SCALE_6) // 固定费用，单位为万分比
  }
  if (mode === FeeMode.AMOUNT_RATIO) {
    return new BigNumber(orderValue).multipliedBy(Number(value)).dividedBy(FEE_RATE_SCALE_8) // 金额比例，单位为亿分比
  }
  if (mode === FeeMode.PER_SHARE) {
    return new BigNumber(quantity).multipliedBy(Number(value)).dividedBy(FEE_RATE_SCALE_8) // 金额比例，单位为亿分比
  }
  return new BigNumber(0)
}

export function calcFeeItem(feeItem: FeeItem, orderValue: number | string, quantity: number | string) {
  let fee = calcFeeByMode(feeItem.mode, feeItem.value, orderValue, quantity)
  if (feeItem.minMode !== FeeMode.NONE) {
    const minFee = calcFeeByMode(feeItem.minMode, feeItem.minValue, orderValue, quantity)
    if (fee.isLessThan(minFee)) {
      fee = minFee
    }
  }
  if (feeItem.minMode !== FeeMode.NONE) {
    const maxFee = calcFeeByMode(feeItem.maxMode, feeItem.maxValue, orderValue, quantity)
    if (fee.isGreaterThan(maxFee) && feeItem.maxValue > 0) {
      fee = maxFee
    }
  }

  return fee
}

export function calcFeeByRuleId(orderValue: number | string, quantity: number | string, feeConfig: FeeItem[]) {
  let ruleId1Fee = new BigNumber(0)
  let ruleId2Fee = new BigNumber(0)
  let ruleId3Fee = new BigNumber(0)
  let ruleId4Fee = new BigNumber(0)

  for (const feeItem of feeConfig) {
    if (feeItem.ruleId === 1) {
      ruleId1Fee = ruleId1Fee.plus(calcFeeItem(feeItem, orderValue, quantity))
    } else if (feeItem.ruleId === 2) {
      ruleId2Fee = ruleId2Fee.plus(calcFeeItem(feeItem, orderValue, quantity))
    } else if (feeItem.ruleId === 3) {
      ruleId3Fee = ruleId3Fee.plus(calcFeeItem(feeItem, orderValue, quantity))
    } else if (feeItem.ruleId === 4) {
      ruleId4Fee = ruleId4Fee.plus(calcFeeItem(feeItem, orderValue, quantity))
    }
  }
  return {
    brokerageFee: ruleId1Fee.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toFixed(2),
    tradingActivityFee: ruleId2Fee.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toFixed(2),
    secFee: ruleId3Fee.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toFixed(2),
    catFee: ruleId4Fee.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toFixed(2)
  }
}

export function useCalcFee(
  orderValue: number | string = '0',
  quantity: number | string = '0',
  isBuy: boolean = true,
  feeRate?: string
) {

  const feeConfig = useTradeStore(state => state.feeConfig)

  const value = new BigNumber(orderValue || 0);

  const feeDetails = {
    platformFeeValue: '0',
    brokerageFeeValue: '0',
    tradingActivityFeeValue: '0',
    secFee: '0',
    catFee: '0',
    estimatedFeeValue: '0',
    allOrderValue: '0'
  }

  if (feeConfig && orderValue && quantity) {
    const { platformFee, buyFeeConfigs, sellFeeConfigs } = feeConfig

    let _feeRate = platformFee
    if (feeRate) { 
      _feeRate = new BigNumber(feeRate).multipliedBy(FEE_RATE_SCALE_8).toNumber()
    }
    // 计算平台服务费
    feeDetails.platformFeeValue = calculatePlatformFee(orderValue, _feeRate)
    // 以ruleId为1的规则为准计算对应的费用

    const ruleFees = calcFeeByRuleId(orderValue || 0, quantity || 0, isBuy ? buyFeeConfigs : sellFeeConfigs)
    const fee = new BigNumber(ruleFees.brokerageFee)
      .plus(ruleFees.tradingActivityFee)
      .plus(ruleFees.secFee)
      .plus(ruleFees.catFee)
      .plus(new BigNumber(feeDetails.platformFeeValue))

    feeDetails.brokerageFeeValue = ruleFees.brokerageFee  
    feeDetails.tradingActivityFeeValue = ruleFees.tradingActivityFee
    feeDetails.secFee = ruleFees.secFee
    feeDetails.catFee = ruleFees.catFee
    feeDetails.estimatedFeeValue = fee.decimalPlaces(2, BigNumber.ROUND_DOWN).toFixed(2)
    feeDetails.allOrderValue = (isBuy ? value.plus(fee) : value.minus(fee)).toString()

  }

  return {
    platformFee: feeDetails.platformFeeValue,
    brokerageFee: feeDetails.brokerageFeeValue,
    tradingActivityFee: feeDetails.tradingActivityFeeValue,
    secFee: feeDetails.secFee,
    catFee: feeDetails.catFee,
    estimatedFee: feeDetails.estimatedFeeValue,
    allOrderValue: feeDetails.allOrderValue
  }
}
