
import { LazyImage } from "@/components/image/LazyImage"
import { Button } from "@/components/ui/button"
import { usePersistentForm } from "@/hooks/usePersistentForm"
import { useTranslation } from "@/hooks/useTranslation"
import { memo, use, useEffect, useMemo, useState } from "react"
import { Upload } from "./Upload"
import { useToast } from "@/hooks/useToast"
import { kycApi } from "@/service/kyc/api"
import type { IKycDetail, IKycSubmitData } from "@/service/kyc/types"
import { RESPONSE_CODE } from "@/config/constants"
import { ErrorBox, FormItemBox, FormItemLabel, InputBox, retryRefresh, SectionBox, SectionTitle } from "./BaseInfo"
import { EditInput } from "@/components/input/EditInput"
import { EmploymentSelect } from "@/components/employment-select"
import type { ApiResponse } from "@/service/client"
import { usePendingStep } from "@/hooks/usePendingStep"


interface FormData {
  
  email: string;
  residentAddress: string;
  // 工作信息
  employment: number; // 就业情况
  description: string; // 就业 时 必填
  addressCertification?: string; // 地址证明
  incomeCertifications?: string[]
}

const ReviewInfo = memo(
  ({
    userInfo,
    refresh,
    onResetRetry,
  }: {
    userInfo?: IKycSubmitData
    refresh?: () => Promise<ApiResponse<IKycDetail>>
    onResetRetry?: () => void
  }) => {
    const { t } = useTranslation()
    const { toastSuccess, toastError  } = useToast()
    
    const { register, handleSubmit, watch, setValue, reset, clear, formState: { errors } } = usePersistentForm<FormData>('kycBaseInfo', {
      employment: 1,
      addressCertification: '',
      incomeCertifications: [],
    });
    const employment = watch('employment')
    const addressCertification = watch('addressCertification')
    const incomeCertifications = watch('incomeCertifications')

    const [addressEditing, setAddressEditing] = useState(false)
    const [incomeEditing, setIncomeEditing] = useState(false)

    const [submiting, setSubmiting] = useState(false)
    
    const onSubmit = async (data: FormData) => {
      const files = (data.incomeCertifications || []).filter(key => key)
      // 无地址证明
      if (!data.addressCertification) {
        toastError({title: t('kyc.t61')})
        return
      }
      if (files.length <= 0) {
        toastError({title: t('identity.upload.uploadIncome')})
        return
      }
      
      const params: any = {
        type: 4,
        idInfo: {
          files: {
            addressCertification: data.addressCertification
          }
        },
        workInfo: {
          employment: data.employment,
          description: data.description
        },
        
        extraInfo: {
          incomeCertifications: (data.incomeCertifications || []).filter(key => key),
        },
        
      }
      console.log(data)
      console.log(params)
      console.log(submiting)
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

    useEffect(() => {
      if (userInfo && userInfo.basicInfo.firstName) {
        reset({
          email: userInfo.basicInfo.email || '',
          residentAddress: userInfo.idInfo.residentAddress || '',
          employment: userInfo.workInfo.employment || 1,
          description: userInfo.workInfo.description, // 就业 时 必填
          addressCertification: userInfo.idInfo.files?.addressCertification, // 地址证明
          incomeCertifications: userInfo.extraInfo.incomeCertifications || []
          
        })
      }
    }, [userInfo])

    return (
      <>
        <div className="bg-[#361604] min-h-[48px] rounded-[4px] flex  text-white font-normal text-[16px] px-5 py-3 leading-[20px]">
          <LazyImage src="/images/kyc/warning.png" className="w-6 h-6 mr-[2px]" />
          {'為確保交易功能正常使用，請您確認並更新個人資料。若您未進行確認，我們將依現有資料提交複審；如複審未通過，您的交易權限可能會受到影響。'}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-2">
          <SectionBox>
            <SectionTitle>{t('kyc.t2')}</SectionTitle>
            <div className=" grid grid-cols-2 font-normal gap-x-6">
              {/* 邮箱 */}
              <FormItemBox>
                <InputBox >
                  <EditInput 
                    label={t('kyc.t9')}
                    placeholder={t('kyc.t4')}
                    error={errors.email?.message}
                    {
                      ...register("email", {
                        required: '邮箱格式不正确，请重新输入',
                        maxLength: {
                          value: 50,
                          message: "最大支持输入50位字符"
                        },
                        pattern: {
                          value: /^(?=[^@]{1,64}@[^@]{1,255}$)(?=.{1,50}$)[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*(?:\.[a-zA-Z]{2,})+$/,
                          message: "邮箱格式不正确，请重新输入"
                        },
                        onChange: (e) => {
                          // 实时限制输入长度
                          if (e.target.value.length > 30) {
                            e.target.value = e.target.value.slice(0, 30);
                          }
                        }
                      })
                      
                    }
                  />
                  <ErrorBox error={errors.email?.message}/>
                </InputBox>
              </FormItemBox>
              
            </div>
            <div className=" grid grid-cols-1 font-normal">
              <FormItemBox>
                <InputBox >
                  <EditInput 
                    label={t('kyc.t14')}
                    placeholder={t('kyc.t4')}
                    error={errors.residentAddress?.message}
                    {
                      ...register("residentAddress", {
                        required: '请输入内容',
                        maxLength: {
                          value: 30,
                          message: "最大支持输入40位字符"
                        },
                        pattern: {
                          value: /^[\u4e00-\u9fa5a-zA-Z0-9]{1,40}$/,
                          message: "只支持中文和英文字母"
                        },
                        onChange: (e) => {
                          // 实时限制输入长度
                          if (e.target.value.length > 40) {
                            e.target.value = e.target.value.slice(0, 40);
                          }
                        }
                      })
                      
                    }
                  />
                  <ErrorBox error={errors.residentAddress?.message}/>
                </InputBox>
                
              </FormItemBox>      
            </div>
            <div className=" grid grid-cols-2 font-normal gap-x-6">
              {/* 就业状况 */}
              <FormItemBox>
                <InputBox >
                  <EmploymentSelect
                    defaultValue={String(employment)}
                    label={t('kyc.t17')}
                    mode="view"
                    onChange={data => {
                      setValue('employment', Number(data.code))
                    }}
                  />
                </InputBox>
              </FormItemBox>
              <FormItemBox>
                <InputBox >
                  <EditInput 
                    label={t('kyc.t23')}
                    placeholder={t('kyc.t4')}
                    error={errors.description?.message}
                    {
                      ...register("description", {
                        required: '请输入内容',
                        maxLength: {
                          value: 30,
                          message: "最大支持输入40位字符"
                        },
                        pattern: {
                          value: /^[\u4e00-\u9fa5a-zA-Z0-9]{1,40}$/,
                          message: "只支持中文和英文字母"
                        },
                        onChange: (e) => {
                          // 实时限制输入长度
                          if (e.target.value.length > 40) {
                            e.target.value = e.target.value.slice(0, 40);
                          }
                        }
                      })
                      
                    }
                  />
                  <ErrorBox error={errors.description?.message}/>
                </InputBox>
              </FormItemBox>
              
            </div>
          </SectionBox>
          
          <SectionBox className="pb-5">
            {/* 上传地址证明 */}
            <div className="text-[18px] font-normal leading-[100%] mb-2 flex items-center justify-between h-[24px]">
              <div className="flex items-center">
                {t('identity.upload.uploadAddr')}
                {
                  !addressEditing &&
                    <div className="ml-4 flex items-center gap-x-1 cursor-pointer"
                    onClick={() => {
                      setAddressEditing(true)
                    }}
                  >
                    <LazyImage src="/images/kyc/edit.png" className="w-[18px] h-[18px]" />
                    <span className="text-[#2962FF] text-[16px]">{t('kyc.t53')}</span>
                  </div>
                }
              </div> 
              {
                addressEditing && 
                  <div className=" flex items-center px-4 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      setAddressEditing(false)
                    }}
                  >
                    <LazyImage src="/images/kyc/confirm.png" className="w-[24px] h-[24px]" />
                  </div>
              }
              
            </div>
            <Upload type="address" 
              mode={addressEditing ? 'edit' : 'view'}
              keys={addressCertification}
              onChanged={keys => {
                setValue('addressCertification', keys as string)
              }}
            />
          </SectionBox> 

          <SectionBox>
            <div className="text-[18px] font-normal leading-[100%] mb-2 flex items-center justify-between h-[24px]">
              <div className="flex items-center">
                {t('kyc.t52')}
                {
                  !incomeEditing &&
                    <div className="ml-4 flex items-center gap-x-1 cursor-pointer"
                    onClick={() => {
                      setIncomeEditing(true)
                    }}
                  >
                    <LazyImage src="/images/kyc/edit.png" className="w-[18px] h-[18px]" />
                    <span className="text-[#2962FF] text-[16px]">{t('kyc.t53')}</span>
                  </div>
                }
              </div> 
              {
                incomeEditing && 
                  <div className=" flex items-center px-4 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIncomeEditing(false)
                    }}
                  >
                    <LazyImage src="/images/kyc/confirm.png" className="w-[24px] h-[24px]" />
                  </div>
              }
              
            </div>
            <div className="h-5"></div>
            <Upload type="extra" 
              mode={incomeEditing ? 'edit' : 'view'}
              keys={incomeCertifications}
              onChanged={keys => {
                // const _keys = (keys as string[]).filter(key => key)
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
      </>
      
    )
  }
)

export { ReviewInfo }