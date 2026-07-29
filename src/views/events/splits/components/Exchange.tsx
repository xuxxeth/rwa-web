import CopyButton from "@/components/button/copyButton";
import { TooltipWithBorder } from "@/components/icon-tooltip";
import { Trans } from "@/components/trans";
import { Button } from "@/components/ui/button";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { useToast } from "@/hooks/useToast";
import { useTokenBalance } from "@/hooks/useTokenBalances";
import { useGetRwaByAddress, useGetTokenByAddress } from "@/hooks/useTokens";
import { useSplit } from "@/hooks/useTrading";
import { useTranslation } from "@/hooks/useTranslation";
import type { IStockActionEvent } from "@/service/event/types";
import { useBaseStore } from "@/stores/baseStore";
import { formatTimestamp, parseAmount, shortenAddress } from "@/utils";
import BigNumber from "bignumber.js";
import { ChevronDown, Copy, AlertTriangle, SpaceIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ExchangeTip } from "./ExchangeTip";

function formatAmountForDisplay(value?: string | number | BigNumber.Value) {
  if (value === undefined || value === null || value === '' || Number(value) === 0) {
    return '0'
  }

  const amount = new BigNumber(value)
  if (!amount.isFinite()) {
    return '--'
  }

  if (amount.gt(0) && amount.lt(0.01)) {
    return '<0.01'
  }

  return amount.decimalPlaces(2, BigNumber.ROUND_DOWN).toFixed().replace(/\.0+$/, '').replace(/\.?0+$/, '')
}

function formatQuantityForDisplay(value?: string | number | BigNumber.Value) {
  if (value === undefined || value === null || value === '' || Number(value) === 0) {
    return '0'
  }

  const amount = new BigNumber(value)
  if (!amount.isFinite()) {
    return '0'
  }

  if (amount.gt(0) && amount.lt(0.01)) {
    return '<0.01'
  }

  return amount.decimalPlaces(2, BigNumber.ROUND_DOWN).toFixed().replace(/\.0+$/, '').replace(/\.?0+$/, '')
}

function calcFractionalShares(
  eventData: IStockActionEvent | null,
  balance: string
) {
  if (!eventData) {
    return {
      integerPart: '0',
      fractionalValue: '0',
      fractionalPart: '0'
    }
  }
  const shares = new BigNumber(balance || "0")
    .multipliedBy(eventData.payoutAmount ?? "0")
    .dividedBy(eventData.payinAmount ?? "1");

  // 整数部分
  const integerPart = shares
    .integerValue(BigNumber.ROUND_DOWN)
    .toFixed(0);

  // 小数部分
  const fractionalPart = shares.minus(integerPart);

  // 小数部分 * 均价，保留 6 位小数（截断），去掉末尾 0
  const fractionalValue = fractionalPart
    .multipliedBy(eventData.fractionalSharesAvgPrice)
    .toFixed();

  return {
    integerPart,
    fractionalValue,
    fractionalPart: fractionalPart.toFixed()
  };
}

function AddressLabel({ address }: { address: string }) {
  return (
    <div className="flex items-center gap-0.5">
      <span className="text-[#9da3af] text-[12px] font-mono">{shortenAddress(address)}</span>
      
      <CopyButton copyText={address} />
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueColor = "text-white",
  underlineLabel = false,
}: {
  label: string | React.ReactNode;
  value: string;
  valueColor?: string;
  underlineLabel?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-0.5 text-[14px]">
      <span
        className={`text-[#9da3af] ${underlineLabel ? "underline decoration-dotted underline-offset-2" : ""}`}
      >
        {label}
      </span>
      <span className={`font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}


export function ExchangeStock({
  currentEvent,
  onSuccess
}: {
  currentEvent: IStockActionEvent | null,
  onSuccess?: () => void
}) {
  const { t } = useTranslation();
  const { account } = useActiveWeb3()
  const [searchParams] = useSearchParams();
  const { toastSuccess, toastError } = useToast()
  const setShowConnect = useBaseStore(state => state.setShowConnect)
  const payinToken = useGetRwaByAddress(currentEvent?.payinAddress)
  const payoutToken = useGetRwaByAddress(currentEvent?.payoutAddress)
  const paymentToken = useGetTokenByAddress(currentEvent?.paymentAddress)
  const payinTokenBalance = useTokenBalance(currentEvent?.payinAddress || '')
  const isHold = Number(payinTokenBalance?.balance) > 0 && account
  const { integerPart, fractionalValue, fractionalPart } = calcFractionalShares(currentEvent, payinTokenBalance?.balance ?? '0')

  const [loading, setLoading] = useState(false)

  const amount = searchParams.get('amount') || (payinTokenBalance?.balance || 0)

  const { exchangeToken } = useSplit(currentEvent?.payinAddress as `0x${string}`, BigInt(parseAmount(amount, 6)))

  const handleExchangeToken = useCallback(async () => {

    setLoading(true)
    try {
      if (!currentEvent?.payinAddress) return
      
      const params = {
        payinToken: currentEvent?.payinAddress,
        payinAmount: parseAmount(amount, payinToken?.decimals || 6).toString()
      }
      console.log(params)
      // onSuccess?.()
      const res = await exchangeToken(params)
      console.log(res)
      if (res?.code === 9200) {
        toastSuccess({title: t('events.t43')})
        await onSuccess?.()
        return
      }
      const errorList = ["userReject", "apIns"]
      // @ts-ignore
      const errorMessage = res?.data?.message
      toastError({title:  errorList.includes(errorMessage) ? t(`appErr.${errorMessage}`) : t('events.t44')})
    } catch (error) {
      console.log(error)
      // @ts-ignore
      toastError({title:  t('events.t44')})
    } finally {
      setLoading(false)
    }
  }, [exchangeToken, currentEvent,payinToken, payinTokenBalance, t])

  return (
    <div className="w-[480px] ">
      {/* Body */}
      <div className="bg-[#131416]  px-5 pb-5 flex flex-col gap-4">
        {/* Exchange preview card */}
        <div className="bg-[#1a1b1e] rounded-[10px] px-4 py-5 flex flex-col gap-3">
          {/* From */}
          <div className="flex flex-col gap-3">
            <span className="text-[#9da3af] text-[14px]">{t("events.t29")}</span>
            <div className="flex items-center justify-between h-10">
              <div className="flex items-center gap-2">
                <img src={payinToken?.icon} alt="AMZNt" className="w-6 h-6 rounded-full object-cover" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-white text-[14px] font-semibold">{payinToken?.symbol || '--'}</span>
                  <AddressLabel address={payinToken?.address || ''} />
                </div>
              </div>
              {
                isHold && account ? <span className="text-white text-[20px] font-semibold">{payinTokenBalance.balance || '--'}</span>
                       : <span className="text-[#737A87] text-[20px] font-semibold">{ account ? t('events.t40') : '--'}</span>
              }
              
            </div>
          </div>

          {/* Divider arrow */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-[#383a40]" />
            <ChevronDown size={14} className="text-[#737a87]" />
            <div className="flex-1 h-px bg-[#383a40]" />
          </div>

          {/* To */}
          <div className="flex flex-col gap-4">
            <span className="text-[#9da3af] text-[14px]">{t("events.t30")}</span>

            {/* AMZNt row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={payoutToken?.icon} alt="AMZNt" className="w-6 h-6 rounded-full object-cover" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-white text-[14px] font-semibold">{payoutToken?.symbol || '--'}</span>
                  <AddressLabel address={payoutToken?.address || ''} />
                </div>
              </div>
              {
                isHold ? (
                  <div className="flex flex-col items-end">
                    <span className="text-[#9cff3a] text-[20px] font-semibold">{formatQuantityForDisplay(integerPart)}</span>
                    <span className="text-[#9da3af] text-[12px]">{t("events.t25")}</span>
                  </div>
                ) : <span className="text-[20px] text-[#737A87] font-semibold">--</span> 
              }
              
            </div>

            {/* USDT row */}
            {
              isHold && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={'/images/tokens/usdt.png'} alt="USDT" className="w-6 h-6 rounded-full object-cover" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-white text-[14px] font-semibold">USDT</span>
                      <span className="text-[#9da3af] text-[12px]">{t("events.t26")}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[#9cff3a] text-[20px] font-semibold">{formatAmountForDisplay(fractionalValue)}</span>
                    <span className="text-[#9da3af] text-[12px]">{t("events.t27")} {`${formatQuantityForDisplay(fractionalPart)} ${payinToken?.symbol}`}</span>
                  </div>
                </div>
              )
            }
            
          </div>
        </div>

        {/* Info rows */}
        <div className="px-1 flex flex-col gap-2">
          <InfoRow label={t('events.t19')} value={currentEvent?.businessType === 1 ? t('events.t17') : t('events.t18')} />
          <InfoRow label={t('events.t15') + t('events.t10')} value={`${formatAmountForDisplay(currentEvent?.payinAmount)} : ${formatAmountForDisplay(currentEvent?.payoutAmount)}`} />
          <InfoRow label={
            <TooltipWithBorder tooltip={t('events.t281')} className="cursor-pointer text-[14px]">
              {t('events.t28')}
            </TooltipWithBorder>
          } value={currentEvent?.fractionalSharesAvgPrice ? `${formatAmountForDisplay(currentEvent?.fractionalSharesAvgPrice)} ${paymentToken?.symbol}/` + t('events.t39') : '--'} valueColor="text-[#9cff3a]" />
          <InfoRow label={t('events.t11')} value={currentEvent?.exchangeStartTime ? formatTimestamp(currentEvent?.exchangeStartTime, true) : '--'} />
          <InfoRow label={t('events.t12')} value={currentEvent?.exchangeEndTime ? formatTimestamp(currentEvent?.exchangeEndTime, true) : '--'}/>
        </div>

        {/* Warning + disabled button */}
        <div className="flex flex-col gap-3">
          {/* Warning banner */}
            {
              (currentEvent?.showStatus !== undefined && currentEvent?.showStatus !== 1 && currentEvent?.exchangeStartTime) && (
                <div className="bg-[rgba(255,178,25,0.1)] rounded-[6px] px-4 py-3 flex items-start gap-1">
                  <img src="/images/icons/annouce.png" className="w-3 h-3 mt-1" alt="" />
                  <ExchangeTip status={currentEvent.showStatus} startTime={currentEvent.exchangeStartTime} />
                </div>

              )
            }
          {
            !account ? (
              <button
                onClick={() => setShowConnect(true)}
                className='bg-white m-auto text-black text-sm/4.5 font-medium px-6 py-2 rounded-[8px] w-full h-11'
              >
                {t('Connect Wallet')}
              </button>
            ) :
            (currentEvent?.showStatus === 1 || currentEvent?.showStatus === 3) && (
              <Button
                className="w-full h-11 rounded-[8px] bg-white text-black hover:bg-white"
                loading={loading}
                disabled={currentEvent?.showStatus === 3 || loading}
                variant="primary"
                onClick={e => {
                  e.stopPropagation()
                  handleExchangeToken()
                }}
              >
                {t("events.t15")}
              </Button>
            )
          }
          
        </div>
      </div>
    </div>
  );
}
