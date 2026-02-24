import { Button } from "@/components/ui/button"
import { ConnectButtonText } from "@/components/button/ConnectButtonText"
import SignButton from "../../button/SignButton"
import { cn } from "@/lib/utils"
import { useRouter } from "@/hooks/useRouter"
import { DialogController, useShowDialog } from "@/components/dialog/DialogController"
import { OrderConfirm } from "../../order-confirm"
import { useTranslation } from "@/hooks/useTranslation"

type TradeButtonUIProps = {
  from?: string
  account?: string
  isSameChain?: boolean
  isSignatureValid: boolean
  refreshIsSignatureValid: () => void
  isPageReady: boolean
  kycButtonText: string
  buttonVariant: "primary" | "warning"
  action: "buy" | "sell"
  buying: boolean
  disabled: boolean
  buttonText: string
  showConfirm: boolean
  onSubmit: () => void
  orderValue: string
  platformFee: string
  brokerageFee: string
  tradingActivityFee: string
  estimatedFee: string
  feeRate: string
  networkFeeInNative: string
}

export function TradeButtonUI({
  from,
  account,
  isSameChain,
  isSignatureValid,
  refreshIsSignatureValid,
  isPageReady,
  kycButtonText,
  buttonVariant,
  action,
  buying,
  disabled,
  buttonText,
  showConfirm,
  onSubmit,
  orderValue,
  platformFee,
  brokerageFee,
  tradingActivityFee,
  estimatedFee,
  feeRate,
  networkFeeInNative,
}: TradeButtonUIProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const orderDialog = useShowDialog()

  return (
    <>
      <div
        className={cn(
          " opacity-0",
          isPageReady ? " opacity-100" : ""
        )}
      >
        {(!account || !isSameChain) ? (
          <div className="mt-3"><ConnectButtonText /></div>
        ) : !isSignatureValid ? (
          <SignButton
            className="mt-3 w-full h-[40px] rounded-[8px] text-[14px]"
            refreshIsSignatureValid={refreshIsSignatureValid}
          />
        ) : kycButtonText ? (
          <Button
            className="h-[40px] w-full mt-3"
            onClick={() => {
              router.push('/identity')
            }}
          >
            {kycButtonText}
          </Button>
        ) : (
          <Button
            variant={buttonVariant}
            loading={buying}
            className={cn(
              "w-full mt-3 ",
              from === 'markets' ? 'h-[40px]' : '',
              action === 'buy'
                ? 'bg-[rgba(37,167,80,0.2)] text-[#2EE4A7]'
                : 'bg-[rgba(202,63,100,0.2)] text-[#F63C6B]'
            )}
            disabled={disabled || buying}
            onClick={() => {
              if (showConfirm) {
                orderDialog.setOpen(true)
                return
              }
              onSubmit()
            }}
          >
            {buttonText}
          </Button>
        )}
      </div>

      <DialogController
        className="p-0"
        headerClassName="px-4 pt-4"
        overlayClassName='z-[49]'
        title={t('v2.tx.t29')}
        open={orderDialog.open}
        openChange={orderDialog.setOpen}
      >
        <OrderConfirm
          action={action}
          orderValue={orderValue}
          platformFee={platformFee}
          brokerageFee={brokerageFee}
          tradingActivityFee={tradingActivityFee}
          estimatedFee={estimatedFee}
          feeRate={feeRate}
          networkFeeInNative={networkFeeInNative}
          onClick={() => {
            orderDialog.hide()
            onSubmit()
          }}
        />
      </DialogController>
    </>
  )
}
