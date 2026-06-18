import { ConnectButton } from "@/components/button/ConnectButton";
import SignButton from "@/components/button/SignButton";
import { DialogController, useShowDialog } from "@/components/dialog/DialogController";
import { LazyImage } from "@/components/image/LazyImage";
import { Trans } from "@/components/trans";
import { Button } from "@/components/ui/button";
import { RESPONSE_CODE } from "@/config/constants";
import { useActiveWeb3 } from "@/hooks/useActiveWe3";
import { useRouter } from "@/hooks/useRouter";
import { useSignatureValidStatus } from "@/hooks/useSignature";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/hooks/useTranslation";
import { useReferralStore } from "@/stores/referralStore";
import { validateInviteCode } from "@/utils";
import { memo, useCallback, useEffect, useState } from "react";


const AutoBindDialog = memo(
  () => {
    const { t } = useTranslation()
    const { account, initialized } = useActiveWeb3()
    const router = useRouter()
    const [isSignatureValid, refreshIsSignatureValid] = useSignatureValidStatus()
    const { toastError, toastSuccess } = useToast()
    const bindDialog = useShowDialog()
    const [inviteCode, setInviteCode] = useState('')

    useEffect(() => {
      if (router.params?.inviteCode && initialized) {
        if (validateInviteCode(router.params.inviteCode)) {
          setInviteCode(router.params.inviteCode)
          bindDialog.setOpen(true)
        }
      }
    }, [router.params?.inviteCode, initialized])

    const [bindLoading, setBindLoading] = useState(false)
    const bindRelationship = useReferralStore(state => state.bindRelationship)

    const handleBind = useCallback(() => {
      if (!account) {
        toastError({title: t("ref.t32")})
        return
      }
      setBindLoading(true)
      bindRelationship(inviteCode)
        .then(res => {
          if (res?.code === RESPONSE_CODE.SUCCESS) {
            toastSuccess({title: t("ref.t33")})
            bindDialog.hide()
            setTimeout(() => {
              router.push('/referral')
            }, 800)
          } else {
            toastError({title: res?.message || t('appErr.signError3')})
            bindDialog.hide()
            if (res?.code === 20003) {
              router.push('/referral')
            }
          }
        })
        .catch((e) => {
          
          if (e.code === 'ERR_CANCELED') {
            toastError({title: t('appErr.signError2')})
          } else {
            toastError({title: t('appErr.signError3')})
          }
          
        })
        .finally(() => {
          setBindLoading(false)
        })
    }, [account, inviteCode, bindRelationship, router, toastError, toastSuccess, bindDialog, t])

    return (
      <DialogController
        className="p-0 bg-[#131416]"
        headerClassName="px-4 pt-4"
        overlayClassName='z-[49]'
        open={bindDialog.open}
        openChange={bindDialog.setOpen}
        disableOutsideClose={true}
      >
        <div className='w-[418px] px-6 font-normal'>
          <div className=' flex justify-center'>
            <LazyImage src='/images/referral/bind.png' className='w-[370px] h-[204px]' />
          </div>
          <div className='my-4 font-medium text-[16px] text-white'>
            <div className='text-center'>
              {/* 您有一份新的邀请，邀请码：<span className='text-[#9CFF3A]'>{inviteCode}</span> */}
              <Trans 
                i18nKey="ref.t27" 
                values={{ r1: inviteCode }} 
                components={{
                  r1: <span className="font-semibold text-[#9CFF3A]" />
                }}
              />
            </div>

            <div className=' text-center'>{t("ref.t271")}</div>
          </div>

          
          {
            !account ? (
              <ConnectButton 
                connectBtnClassName="
                  h-[48px]
                  w-full
                  rounded-[8px]
                  bg-[#98FF2F]
                  text-[16px]
                  font-semibold
                  text-black
                  hover:bg-[#8df028]
                  justify-center
                "
              />
            ) : 
            isSignatureValid ? (
              <Button
                className="
                  h-[48px]
                  w-full
                  rounded-[8px]
                  bg-[#98FF2F]
                  text-[16px]
                  font-semibold
                  text-black
                  hover:bg-[#8df028]
                "
                disabled={bindLoading}
                loading={bindLoading}
                onClick={handleBind}
              >
                {t("ref.t30")}
              </Button>
            ) : (
              <SignButton 
                callback={handleBind}
                refreshIsSignatureValid={refreshIsSignatureValid} 
                label={t("ref.t28")}
                className="bg-[#9cff3a] h-[48px] w-full font-semibold text-[16px] " />
            )

          }
          
          <div className='flex justify-center text-[#9CFF3A] text-[16px] font-medium py-4 cursor-pointer mb-2' 
            onClick={() => {
              bindDialog.hide()
            }}
          >
            {t("ref.t29")}
          </div>
        </div>
      </DialogController>
    )
    
  }
)

export { AutoBindDialog }