import { Button } from "@/components/ui/button"
import { usePersistentForm } from "@/hooks/usePersistentForm"
import { useTranslation } from "@/hooks/useTranslation"
import { memo, useState } from "react"
import { Upload } from "./Upload"
import { useToast } from "@/hooks/useToast"
import { kycApi } from "@/service/kyc/api"
import type { IKycDetail } from "@/service/kyc/types"
import { RESPONSE_CODE } from "@/config/constants"
import { retryRefresh, SectionBox, SectionTitle } from "./BaseInfo"
import {
  Text,
} from './Upload/shared'
import type { ApiResponse } from "@/service/client"
import { usePendingStep } from "@/hooks/usePendingStep"
import { WarningInfo } from "./WarningInfo"

interface FormData {
  incomeCertifications?: string[]

}

const Risk3Info = memo(
  ({
    refresh,
    reviewCommentToUser
  }: {
    refresh?: () => Promise<ApiResponse<IKycDetail>>
    reviewCommentToUser?: string
  }) => {
    const { t } = useTranslation()
    const pendingStep = usePendingStep()
    const { toastSuccess, toastError  } = useToast()
    const { handleSubmit, watch, setValue, clear, formState: { errors } } = usePersistentForm<FormData>('kycBaseInfo', {
      incomeCertifications: []
    });
    const incomeCertifications = watch('incomeCertifications')

    const [submiting, setSubmiting] = useState(false)
    
    const onSubmit = async (data: FormData) => {
      const files = (data.incomeCertifications || []).filter(key => key)
      // 无收入证明
      if (files.length <= 0) {
        toastError({title: t('identity.upload.uploadIncome')})
        return
      }
      const params: any = {
        type: pendingStep.step ? 3 : 1, // 1, 3
        extraInfo: {
          incomeCertifications: files
        },
      }

      if (submiting) return
      setSubmiting(true)
      const res = await kycApi.submitKyc(params)
      if (res?.code === RESPONSE_CODE.SUCCESS) {
        if (refresh) {
          const detailRes = await retryRefresh(refresh)
          setSubmiting(false)
          if (detailRes.code === RESPONSE_CODE.SUCCESS && detailRes.data?.overallStatus) {
            // toastSuccess({ title: '提交成功' })
            clear()
          }
        } else {
          // toastSuccess({ title: '提交成功' })
          clear()
          setSubmiting(false)
        }
      } else {
        toastError({ title: res?.message || '提交失败' })
        setSubmiting(false)
     }
      
    }

    return (

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <SectionBox className="pb-2">
              <SectionTitle>{t('kyc.t19')}</SectionTitle>
              {
                reviewCommentToUser && 
                <div className=" my-5">
                  <WarningInfo text={reviewCommentToUser } />
                </div>
              }
              
              <div className="my-5">
                <Text text='uploadIncome' className=' ' />
                <Text text='extraTips' className='text-sm mt-2' />
              </div>
              <Upload
                step={pendingStep.step}
                type='extra'
                keys={incomeCertifications}
                onChanged={keys => {
                  setValue('incomeCertifications', keys as string[])
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

export { Risk3Info }