import { Button } from "@/components/ui/button"
import { usePersistentForm } from "@/hooks/usePersistentForm"
import { useTranslation } from "@/hooks/useTranslation"
import { memo, useEffect, useMemo, useState } from "react"
import { Upload } from "./Upload"
import { useToast } from "@/hooks/useToast"
import { kycApi } from "@/service/kyc/api"
import type { IKycDetail, IKycSubmitData } from "@/service/kyc/types"
import { RESPONSE_CODE } from "@/config/constants"
import { retryRefresh, SectionBox, SectionTitle } from "./BaseInfo"
import type { ApiResponse } from "@/service/client"
import { usePendingStep } from "@/hooks/usePendingStep"
import { WarningInfo } from "./WarningInfo"

interface FormData {
  idCardFront?: string
  idCardBack?: string
  idCard?: string
  passport?: string
}

const IDExpired = memo(
  ({
    userInfo,
    refresh,
    expired,
    reviewCommentToUser
  }: {
    userInfo?: IKycSubmitData
    refresh?: () => Promise<ApiResponse<IKycDetail>>
    expired?: boolean
    reviewCommentToUser?: string
  }) => {
    const { t } = useTranslation()
    const pendingStep = usePendingStep()
    const { toastSuccess, toastError  } = useToast()
    const { register, handleSubmit, watch, reset, setValue, clear, formState: { errors } } = usePersistentForm<FormData>('kycBaseInfo', {
    });
    const idCardFront = watch('idCardFront')
    const idCardBack = watch('idCardBack')
    const idCard = watch('idCard')
    const passport = watch('passport')
    const type = useMemo(() => userInfo?.idInfo.type ?? 1, [userInfo])
    
    const [submiting, setSubmiting] = useState(false)
    
    const onSubmit = async (data: FormData) => {
      // 1. 判断有没有上传证件照
      if (type === 0) {
        // 身份证，正反面都要传
        if (!data.idCardFront) {
          toastError({ title: t('kyc.t56') })
          return
        }
        if (!data.idCardBack) {
          toastError({ title: t('kyc.t57') })
          return
        }
        if (!data.idCard) {
          toastError({ title: t('kyc.t59') })
          return
        }
      }
      if (type === 1) {
        // 只判断护照
        if (!data.passport) {
          toastError({ title: t('kyc.t58') })
          return
        }
      }

      const params: any = {
        type: (expired || pendingStep.step) ? 2 : 1,
        idInfo: {
          type: type,
          files: {
            idCardFront: type === 0 ? data.idCardFront || '' : '',
            idCardBack: type === 0 ? data.idCardBack || '' : '',
            idCard: type === 0 ? data.idCard || '' : '',
            passport: type === 0 ? '' : data.passport || '',
          },
        },
        
      }
      if (submiting) return
      setSubmiting(true)
      const res = await kycApi.submitKyc(params)
      setSubmiting(false)
      if (res?.code === RESPONSE_CODE.SUCCESS) {
        if (refresh) {
          const detailRes = await retryRefresh(refresh)
          setSubmiting(false)
          if (detailRes.code === RESPONSE_CODE.SUCCESS && detailRes.data?.overallStatus) {
            // expired && toastSuccess({ title: '提交成功' })
            clear()
          }
        } else {
          // expired && toastSuccess({ title: '提交成功' })
          clear()
          setSubmiting(false)
        }
      } else {
        toastError({ title: res?.message || 'Error' })
        setSubmiting(false)
      }
      
    }

    useEffect(() => {
      if (userInfo && userInfo.basicInfo.firstName) {
        reset({
          idCardFront: userInfo.idInfo?.files?.idCardFront,
          idCardBack: userInfo.idInfo?.files?.idCardBack,
          idCard: userInfo.idInfo?.files?.idCard,
          passport: userInfo.idInfo?.files?.passport,

        })
      }
    }, [userInfo])

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-2">
        
        <SectionBox className="pb-5">
          <SectionTitle>{(expired ? t('kyc.t242') : t('kyc.t241')) + t('kyc.t24')}</SectionTitle>
          {
            reviewCommentToUser && 
            <div className=" mt-5">
              <WarningInfo text={reviewCommentToUser } />
            </div>
          }
          <div className="h-5"></div>
          {/* 上传证件 */}
          <Upload
            step={pendingStep.step}
            // type={type === 1 ? 'passport' : 'identity'}
            type={'passport'}
            keys={type === 1 ? passport : [idCardFront || '', idCardBack || '', idCard || '']}
            onChanged={keys => {
              setValue('passport', keys as string)
              // if (type === 1) {
              //   setValue('passport', keys as string)
              // } else {
              //   setValue('idCardFront', keys[0])
              //   setValue('idCardBack', keys[1])
              //   setValue('idCard', keys[2])
              // }
            }}
          />
        </SectionBox>  
        
        <div className="flex justify-center mt-8">
          <Button disabled={submiting} loading={submiting} type="submit" className="bg-white text-black w-full lg:w-[400px] rounded-[8px]"
          >
            { t('identity.continue') }
            
          </Button>
        </div>

      </form>
    )
  }
)

export { IDExpired }