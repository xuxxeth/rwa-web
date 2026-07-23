import CopyButton from "@/components/button/copyButton";
import { TooltipWithBorder } from "@/components/icon-tooltip";
import { Trans } from "@/components/trans";
import { Button } from "@/components/ui/button";
import { useTokenBalance } from "@/hooks/useTokenBalances";
import { useGetRwaByAddress, useGetTokenByAddress } from "@/hooks/useTokens";
import { useTranslation } from "@/hooks/useTranslation";
import type { IStockActionEvent } from "@/service/event/types";
import { formatTimestamp, shortenAddress } from "@/utils";
import BigNumber from "bignumber.js";
import { ChevronDown, Copy, AlertTriangle } from "lucide-react";

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
    .multipliedBy(eventData.payinAmount ?? "0")
    .dividedBy(eventData.payoutAmount ?? "1");

  // 整数部分
  const integerPart = shares
    .integerValue(BigNumber.ROUND_DOWN)
    .toFixed(0);

  // 小数部分
  const fractionalPart = shares.minus(integerPart);

  // 小数部分 * 均价，保留 6 位小数（截断），去掉末尾 0
  const fractionalValue = fractionalPart
    .multipliedBy(eventData.fractionalSharesAvgPrice)
    .decimalPlaces(6, BigNumber.ROUND_DOWN)
    .toFixed()
    .replace(/\.?0+$/, "");

  return {
    integerPart,
    fractionalValue,
    fractionalPart: fractionalPart.decimalPlaces(6, BigNumber.ROUND_DOWN).toFixed().replace(/\.?0+$/, "")
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

export function ExchangeTip({status, startTime}: {status: number, startTime: number}) {
  const { t } = useTranslation();

  return (
    <>
      {
        status === 0 && (
          <span className="text-[#c7ccd6] text-[12px] leading-normal">
            {t('events.t31', {t1: formatTimestamp(startTime, true)})}
          </span>
        )
      }
      {
        status === 2 && (
          <span className="text-[#c7ccd6] text-[12px] leading-normal">
            {t('events.t33')}
          </span>
        )
      }
      {
        status === 3 && (
          <span className="text-[#c7ccd6] text-[12px] leading-normal">
            <Trans 
              i18nKey="events.t32" 
              values={{ }} 
              components={{
                r1: (
                  <span
                    className="text-[#009DFF] cursor-pointer"
                    onClick={() => {
                      console.log("点击了 r1");
                    }}
                  />
                ),
                r2: <span className=" text-[#009DFF]" />,
              }}
            />
          </span>
        )
      }
    </>

  )
}

export function ExchangeStock({
  currentEvent,
}: {
  currentEvent: IStockActionEvent | null
}) {
  const { t } = useTranslation();
  const payinToken = useGetRwaByAddress(currentEvent?.payinAddress)
  const payoutToken = useGetRwaByAddress(currentEvent?.payoutAddress)
  const paymentToken = useGetTokenByAddress(currentEvent?.paymentAddress)
  const payinTokenBalance = useTokenBalance(currentEvent?.payinAddress || '')

  // console.log(currentEvent, payinToken, payoutToken, paymentToken, payinTokenBalance)

  const { integerPart, fractionalValue, fractionalPart } = calcFractionalShares(currentEvent, payinTokenBalance.balance ?? '0')
  console.log(integerPart, fractionalValue)
  
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
              <span className="text-white text-[20px] font-semibold">{payinTokenBalance.balance || '--'}</span>
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
              <div className="flex flex-col items-end">
                <span className="text-[#9cff3a] text-[20px] font-semibold">{integerPart}</span>
                <span className="text-[#9da3af] text-[12px]">{t("events.t25")}</span>
              </div>
            </div>

            {/* USDT row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={'/images/tokens/usdt.png'} alt="USDT" className="w-6 h-6 rounded-full object-cover" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-white text-[14px] font-semibold">USDT</span>
                  <span className="text-[#9da3af] text-[12px]">{t("events.t26")}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[#9cff3a] text-[20px] font-semibold">{fractionalValue}</span>
                <span className="text-[#9da3af] text-[12px]">{t("events.t27")} {`${fractionalPart} ${payinToken?.symbol}`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="px-1 flex flex-col gap-2">
          <InfoRow label={t('events.t19')} value={currentEvent?.businessType === 1 ? t('events.t17') : t('events.t18')} />
          <InfoRow label={t('events.t15') + t('events.t10')} value={`${currentEvent?.payinAmount} : ${currentEvent?.payoutAmount}`} />
          <InfoRow label={
            <TooltipWithBorder tooltip={t('events.t281')} className="cursor-pointer text-[14px]">
              {t('events.t28')}
            </TooltipWithBorder>
          } value={`${currentEvent?.fractionalSharesAvgPrice} ${paymentToken?.symbol}/` + t('events.t39')} valueColor="text-[#9cff3a]" />
          <InfoRow label={t('events.t11')} value={currentEvent?.exchangeStartTime ? formatTimestamp(currentEvent?.exchangeStartTime, true) : '--'} />
          <InfoRow label={t('events.t12')} value={currentEvent?.exchangeEndTime ? formatTimestamp(currentEvent?.exchangeEndTime, true) : '--'}/>
        </div>

        {/* Warning + disabled button */}
        <div className="flex flex-col gap-3">
          {/* Warning banner */}
          <div className="bg-[rgba(255,178,25,0.1)] rounded-[6px] px-4 py-3 flex items-start gap-2.5">
            <AlertTriangle size={12} className="text-[#ffb219] flex-shrink-0 mt-0.5" />
            {
                (currentEvent?.showStatus !== undefined && currentEvent?.exchangeStartTime) && (
                  <ExchangeTip status={3} startTime={currentEvent.exchangeStartTime} />
                )
              }
            
          </div>

          {
            (currentEvent?.showStatus === 1 || currentEvent?.showStatus === 3) && (
              <Button
                disabled={currentEvent?.showStatus === 3}
                variant="primary"
                className="w-full h-11 rounded-[8px] bg-white text-black hover:bg-white"
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
