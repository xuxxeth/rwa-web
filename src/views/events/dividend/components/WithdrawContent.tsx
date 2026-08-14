import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

function ChainIcon({ src }: { src: string }) {
  return (
    <div className="relative shrink-0 size-[28px]">
      <img
        alt=""
        className="absolute inset-0 size-full object-cover rounded-full pointer-events-none"
        src={src}
      />
    </div>
  );
}

type ButtonState = "primary" | "switch" | "disabled";

interface ChainCardProps {
  logo: React.ReactNode;
  chainName: string;
  isCurrent?: boolean;
  dividendAmount: string;
  buttonState: ButtonState;
  buttonLabel: string;
  onClaim?: () => void;
}

function ChainCard({
  logo,
  chainName,
  isCurrent,
  dividendAmount,
  buttonState,
  buttonLabel,
  onClaim,
}: ChainCardProps) {
  const { t } = useTranslation()
  const btnClass =
    buttonState === "primary"
      ? "bg-[#9cff3a] text-black hover:brightness-95 active:brightness-90 cursor-pointer"
      : buttonState === "switch"
      ? "bg-[rgba(156,255,58,0.1)] text-[#9cff3a] hover:bg-[rgba(156,255,58,0.15)] active:bg-[rgba(156,255,58,0.2)] cursor-pointer"
      : "bg-[#232427] text-[#41464f] cursor-not-allowed";

  return (
    <div className="bg-[#1a1b1e] rounded-[12px] w-full">
      <div className="flex flex-col gap-[20px] items-start px-[16px] py-[20px]">
        <div className="flex gap-[8px] items-center w-full">
          {logo}
          <span className="font-medium text-[16px] text-white leading-normal whitespace-nowrap">
            {chainName}
          </span>
          {isCurrent && (
            <div className="bg-[rgba(156,255,58,0.08)] flex h-[24px] items-center justify-center px-[8px] rounded-[12px] shrink-0">
              <span className="font-normal text-[#9cff3a] text-[12px] leading-normal whitespace-nowrap">
                {t('events.t72')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-[4px] items-start justify-center">
            <span className="font-normal text-[#737a87] text-[12px] leading-normal">
              {t('events.t61')}
            </span>
            <span className="font-medium text-[16px] text-white leading-normal whitespace-nowrap">
              {dividendAmount}
            </span>
          </div>

          <Button
            variant="primary"
            disabled={buttonState === "disabled"}
            onClick={buttonState !== "disabled" ? onClaim : undefined}
            className={`h-[40px] rounded-[8px] w-[112px] text-[14px] font-medium leading-normal transition-all shrink-0 disabled:bg-[#232427] ${btnClass}`}
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}


function WithdrawContent() {
  const { t } = useTranslation()
  return (
    <div className="bg-[#131416] w-[418px] rounded-bl-[16px] rounded-br-[16px] px-[24px] pb-[24px] pt-[4px] flex flex-col gap-[24px]">
      {/* Total summary row */}
      <div className="flex items-center justify-between w-full px-[4px] pb-[4px]">
        <span className="font-normal text-[#737a87] text-[14px] leading-normal">
          {t('events.t71')}
        </span>
        <span className="font-medium text-white text-[14px] leading-normal whitespace-nowrap">
          50,000.00 USDT
        </span>
      </div>

      {/* Chain cards */}
      <div className="flex flex-col gap-[8px] w-full">
        <ChainCard
          logo={''}
          chainName="BNB chain"
          isCurrent
          dividendAmount="30,000.00 USDT"
          buttonState="primary"
          buttonLabel={t('events.t73')}
          onClaim={() => {}}
        />
        <ChainCard
          logo={''}
          chainName="X Layer"
          dividendAmount="10,000.00 USDT"
          buttonState="switch"
          buttonLabel={t('events.t74')}
          onClaim={() => {}}
        />
        <ChainCard
          logo={<ChainIcon src={''} />}
          chainName="Linea"
          dividendAmount="10,000.00 USDT"
          buttonState="disabled"
          buttonLabel={t('events.t75')}
        />
      </div>
    </div>
  )
}

export { WithdrawContent }