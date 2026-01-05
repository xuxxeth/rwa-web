import { Button } from "@/components/ui/button"
import { usePersistentForm } from "@/hooks/usePersistentForm"
import { useTranslation } from "@/hooks/useTranslation"
import { memo, useId, useMemo, useState } from "react"
import { Upload } from "./Upload"
import { useToast } from "@/hooks/useToast"
import { kycApi } from "@/service/kyc/api"
import { RESPONSE_CODE } from "@/config/constants"
import { ErrorBox, InputBox, retryRefresh, SectionBox, SectionTitle } from "./BaseInfo"
import { LazyImage } from "@/components/image/LazyImage"
import { KycInput } from "@/components/input/KycInput"
import { KycTextarea } from "@/components/input/KycTextarea"
import { useFieldArray } from "react-hook-form"
import type { ApiResponse } from "@/service/client"
import type { IKycDetail } from "@/service/kyc/types"
import { usePendingStep } from "@/hooks/usePendingStep"
import { WarningInfo } from "./WarningInfo"

function findEmptyItemIndices(list: IExtraInfoItem[]) {
  return list
    .map((item, index) => {
      const isDescriptionEmpty = !item.description || item.description.trim() === '';
      const isFilesEmpty = !item.files || item.files.length === 0 || !item.files[0];
      return { isEmpty: isDescriptionEmpty && isFilesEmpty, index };
    })
    .filter(item => item.isEmpty)
    .map(item => item.index);
}

export type IExtraInfoItem = {
  name: string,
  files?: string[],
  description: string
}

interface FormData {
  extraList: IExtraInfoItem[]
}

const ExtraInfo = memo(
  ({
    refresh,
    reviewCommentToUser
  }: {
    refresh?: () => Promise<ApiResponse<IKycDetail>>,
    reviewCommentToUser?: string
  }) => {
    const { t } = useTranslation()
    const pendingStep = usePendingStep()
    const { toastSuccess, toastError  } = useToast()
    const { register, handleSubmit, watch, setValue, clear, control, formState: { errors } } = usePersistentForm<FormData>('kycBaseInfo', {
      extraList: [
        { name: "", description: "", files: [] },
      ]
    });
    const _id = useId()
    const { fields, append, remove } = useFieldArray({
      control,
      name: "extraList"
    });

    const extraList = watch('extraList')

    const errorList = findEmptyItemIndices(extraList) || []

    const [submiting, setSubmiting] = useState(false)
    
    const onSubmit = async (data: FormData) => {
      if (errorList.length > 0) {
        toastError({title: t('kyc.t60')})
        return
      }

      const extras = data.extraList.map(extra => {
        return {
          ...extra,
          files: extra.files?.filter(file => file)
        }
      })
      const params: any = {
        type: pendingStep.step ? 3 : 1,
        extraInfo: {
          extras: extras
        }
        
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
            // toastSuccess({ title: '提交成功' })
            clear()
          }
        } else {
          // toastSuccess({ title: '提交成功' })
          clear()
          setSubmiting(false)
        }
      } else {
        toastError({ title: res?.message || 'Error' })
        setSubmiting(false)
      }
      
    }

    const handlePlus = async (action: string, index: number) => {

    }

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-2">
        
        {/* <SectionBox className="pb-5"> */}
          <SectionTitle>{t('kyc.t25')}</SectionTitle>
          <div className=" my-5">
            <WarningInfo text={reviewCommentToUser || t('kyc.t26')} />
          </div>
          {
            fields.map((item, index) => {
              return (
                <div key={`${_id}-${index}`} className=" flex justify-between mb-5">
                  <SectionBox className="p-4 w-full"> 
                    <div className=" grid grid-cols-2 mb-5">
                      <div>
                        <div className="flex items-end justify-between font-normal mb-2">
                          <div className="text-[16px]">{t('kyc.t40')} </div>
                          <div className="text-[12px] text-[#909090]">{extraList[index].name.length}/30</div>
                        </div>
                        <InputBox >
                          <KycInput 
                            className=""
                            placeholder={t('kyc.t4')}
                            value={extraList[index].name}
                            error={errors.extraList?.[index]?.name?.message}
                            {
                              ...register(`extraList.${index}.name`, {
                                required: t('kyc.t54', { num: 30 }),
                                maxLength: {
                                  value: 30,
                                  message: t('kyc.t54', { num: 30 }),
                                },
                                pattern: {
                                  value: /^[a-zA-Z\u4e00-\u9fa5]+$/,
                                  message: t('kyc.t64')
                                },
                                
                              })
                              
                            }
                          />
                          <ErrorBox error={errors.extraList?.[index]?.name?.message}/>
                        </InputBox>
                      </div>
                    </div>
                    <div className="font-normal mb-2">
                      <div className="text-[16px]">{t('kyc.t41')} </div>
                      <div className="text-[16px] text-[rgba(255,255,255,0.6)] mt-2">
                        {t('kyc.t44')}：{t('kyc.t43')}
                      </div>
                    </div>
                    <Upload type="extra" 
                      step={pendingStep.step}
                      mode="edit"
                      keys={extraList[index].files}  
                      onChanged={keys => {
                        setValue(`extraList.${index}.files`, keys as string[])
                      }}   
                    />
                    <div className="font-normal my-5">
                      <div className="text-[16px]">{t('kyc.t42')}</div>
                    </div>
                    <InputBox>
                      <KycTextarea placeholder={t('kyc.t4')} 
                        {
                          ...register(`extraList.${index}.description`, {
                            required: false,
                            validate: value => {
                              // 空值：不校验，直接通过
                              if (!value || !value.trim()) return true

                              // 有值：按规则校验
                              const regex = /^[\u4e00-\u9fa5a-zA-Z0-9]{1,200}$/
                              return (
                                regex.test(value) || t('kyc.t63')
                              )
                            },
                          })
                          
                        }
                      />
                    </InputBox>
                    <ErrorBox error={errors.extraList?.[index]?.description?.message}/>
                    {
                      errorList.includes(index) && <ErrorBox error={t('kyc.t65')}/>
                    }
                    
                  </SectionBox>
                  <div className="w-[24px] ml-5 shrink-0">
                    {
                      fields.length > 1 && 
                        <LazyImage src="/images/kyc/minus.png" className="w-6 h-6 mb-5 cursor-pointer"
                        onClick={() => remove(index)}
                      />
                    }
                    {
                      index === fields.length - 1 && 
                        <LazyImage src="/images/kyc/plus.png" className="w-6 h-6 cursor-pointer" 
                        onClick={() => append({ name: "", description: "", files: [] })}
                      />
                    }
                    
                  </div>
                </div>
              )
            })
          }
          
          
        {/* </SectionBox>   */}
        
        <div className="flex justify-center mt-8">
          <Button disabled={submiting} loading={submiting} type="submit" className="bg-white text-black w-full lg:w-[400px] rounded-[8px]"
          >
            { t('kyc.t39') }
            
          </Button>
        </div>

      </form>
    )
  }
)

export { ExtraInfo }