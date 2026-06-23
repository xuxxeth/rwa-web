import { useBaseStore } from '@/stores/baseStore'
import BigNumber from 'bignumber.js'
import { FeeMode, useMarket, type CommissionConfig, type FeeItem } from 'ca-common-web'
import { useEffect, useMemo } from 'react'
import { useActiveWeb3 } from './useActiveWe3'
import type { Address } from '@/config/constants'
import { useTradeStore } from '@/stores/tradeStore'

export function formatFeeRate(
  value: BigNumber.Value,
  scale = FEE_RATE_SCALE_6
): string {
  return new BigNumber(value)
    .dividedBy(scale)
    .toFixed()
    .replace(/\.?0+$/, '')
}

export function calcFeeRateValue(feeItem: CommissionConfig) {
  let value = '0.00'
  let minValue = '0.00'
  minValue = formatFeeRate(feeItem.min, FEE_RATE_SCALE_6) 
  value = formatFeeRate(feeItem.rate * 100, FEE_RATE_SCALE_6) + '%' 
  
  return {
    value,
    minValue,
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
  const defaultFeeRate = { value: '0.00', minValue: '0.00', noFee: true }
  useEffect(() => {
    const fetchFeeConfig = async () => {
      try {
        const feeConfig = await getFeeConfig()
        if (feeConfig) {
          const platformFeeRate = formatFeeRate(feeConfig.platformFee, FEE_RATE_SCALE_6)
          const buyRuleId1FeeItem = feeConfig.buyFeeConfigs

          const buyFeeRate = {
            platformFeeRate: { value: platformFeeRate, minValue: '0.00', maxValue: '0.00' },
            brokerageFeeRate: buyRuleId1FeeItem ? calcFeeRateValue(buyRuleId1FeeItem) : defaultFeeRate,
          }

          const sellRuleId1FeeItem = feeConfig.sellFeeConfigs
          
          const sellFeeRate = {
            platformFeeRate: { value: platformFeeRate, minValue: '0.00', maxValue: '0.00' },
            brokerageFeeRate: sellRuleId1FeeItem ? calcFeeRateValue(sellRuleId1FeeItem) : defaultFeeRate,
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
    - 平台服务费 = 委托金额*配置百分比
    精度规则：
    - 四舍五入至小数点后两位
 */

export function calculatePlatformFee(amount: number | string, feeRate: number | string = 0.004): string {
  const fee = new BigNumber(amount)
    .multipliedBy(feeRate)
    .dividedBy(FEE_RATE_SCALE_6)
    .decimalPlaces(2, BigNumber.ROUND_HALF_UP) // 四舍五入至小数点后两位
  return fee.toFixed(2)
}

export const FEE_RATE_SCALE_6 = 1000000 // 万分比
export const FEE_RATE_SCALE_8 = 100000000 // 亿分比

export function calcFeeByConfig(orderValue: number | string, feeConfig: CommissionConfig) {
  let minFee = new BigNumber(feeConfig.min).dividedBy(FEE_RATE_SCALE_6)
  let rateFee = new BigNumber(orderValue).multipliedBy(Number(feeConfig.rate)).dividedBy(FEE_RATE_SCALE_6)
  let fee = rateFee.isLessThan(minFee) ? minFee : rateFee
  return {
    brokerageFee: Number(orderValue) > 0 ? fee.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toFixed(2) : '0',
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
    estimatedFeeValue: '0',
    allOrderValue: '0'
  }

  if (feeConfig && orderValue) {
    const { platformFee, buyFeeConfigs, sellFeeConfigs } = feeConfig
    
    let _feeRate = platformFee
    if (feeRate) { 
      _feeRate = new BigNumber(feeRate).multipliedBy(FEE_RATE_SCALE_6).toNumber()
    }
    // 计算平台服务费
    feeDetails.platformFeeValue = calculatePlatformFee(orderValue, _feeRate)
    // 以ruleId为1的规则为准计算对应的费用

    const ruleFees = calcFeeByConfig(orderValue || 0, isBuy ? buyFeeConfigs : sellFeeConfigs)
    const fee = new BigNumber(ruleFees.brokerageFee)
      .plus(new BigNumber(feeDetails.platformFeeValue))

    feeDetails.brokerageFeeValue = ruleFees.brokerageFee  
    feeDetails.estimatedFeeValue = fee.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toFixed(2)
    feeDetails.allOrderValue = (isBuy ? value.plus(fee) : value.minus(fee)).toString()

  }

  return {
    platformFee: feeDetails.platformFeeValue,
    brokerageFee: feeDetails.brokerageFeeValue,
    estimatedFee: feeDetails.estimatedFeeValue,
    allOrderValue: feeDetails.allOrderValue
  }
}
