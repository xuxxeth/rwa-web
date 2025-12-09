import { CheckBox, CheckBoxBySVG } from "@/components/check-box"
import { CountrySelect } from "@/components/country-select"
import { DatePicker, FormatStr } from "@/components/date-range-picker"
import { DoctypeSelect } from "@/components/doctype-select"
import { LazyImage } from "@/components/image/LazyImage"
import { KycInput } from "@/components/input/KycInput"
import { Select } from "@/components/select"
import { Button } from "@/components/ui/button"
import { usePersistentForm } from "@/hooks/usePersistentForm"
import { useTranslation } from "@/hooks/useTranslation"
import { memo, useEffect, useMemo, useState } from "react"
import { Upload } from "./Upload"
import { cn } from "@/utils/tw"
import { EmploymentSelect } from "@/components/employment-select"
import { IncomeSelect } from "@/components/income-select"
import { format } from "date-fns/format"
import storage from "@/utils/storage"
import { KYC_UPLOAD_STORAGE_KEY } from "./Upload/shared"
import { useToast } from "@/hooks/useToast"
import { kycApi } from "@/service/kyc/api"
import type { IKycSubmitData } from "@/service/kyc/types"
import { RESPONSE_CODE } from "@/config/constants"


export const SectionTitle = ({ children }: { children: React.ReactNode}) => {
  return (
    <div className="text-[18px] font-normal leading-[100%]">
      { children }
    </div>
  )
}

export const SectionBox = ({ children, className }: { children: React.ReactNode, className?: string}) => {
  return (
    <div className={cn(
      "p-5 bg-[#0E0E0E] rounded-[4px] pb-0 mb-2",
      className
    )}>
      { children }
    </div>
  )
}
export const FormItemBox = ({ children }: { children: React.ReactNode}) => {
  return (
    <div className="my-5">
      { children }
    </div>
  )
}
export const FormItemLabel = ({ children, title }: { children?: React.ReactNode, title?: string}) => {
  return (
    <div className="flex items-center text-[#909090] text-[16px] font-normal">
      { children || title } <span className="text-[#CA3F64] ml-1 flex items-center">*</span>
    </div>
  )
}

export const InputBox = ({ children }: { children: React.ReactNode}) => {
  return (
    <div className=" mt-2">
      { children }
    </div>
  )
}
export const ErrorBox = ({ children, error }: { children?: React.ReactNode, error?: string}) => {
  if (!error && !children) return null
  return (
    <div className="text-[#CA3F64] text-[12px] font-normal mt-2 flex items-center">
      <LazyImage src="/images/kyc/error.png" className="w-[14px] h-[14px] mr-1" />
      { children || error }
    </div>
  )
}

export const calcYearDate = function() {
  const now = new Date();

  // 计算最小日期（65岁 —— 最早生日）
  const minDate = new Date(
    now.getFullYear() - 65,
    now.getMonth(),
    now.getDate()
  ).getTime();

  // 计算最大日期（18岁 —— 最晚生日）
  const maxDate = new Date(
    now.getFullYear() - 18,
    now.getMonth(),
    now.getDate()
  ).getTime();

  return {
    minDate,
    maxDate,
    defaultDate: maxDate
  }
}

interface FormData {
  // 基础信息
  firstName: string;
  lastName: string;
  fullName: string;
  gendar: number; // 0女，1男
  dob: string; // 出生日期
  email: string;
  // 证件信息
  type: number; // 0身份证, 1护照 
  issueCountry: string
  no: string;
  residentAddress: string;
  useCertificateAddress?: boolean; // 是否使用证件地址
  // 工作信息
  employment: number; // 就业情况
  description: string; // 就业 时 必填
  // 收信息
  source: number;
  approvedProtocols: string[]

}

const BaseInfo = memo(
  () => {
    const { t } = useTranslation()
    const { toastSuccess, toastError  } = useToast()
    const [dateOptions, setDateOptions] = useState({
      minDate: 0,
      maxDate: 0,
      defaultDate: 0
    })
    const genderList = [
      {value: '1', label: t('gender.male')},
      {value: '0', label: t('gender.female')},

    ]
    const { register, handleSubmit, watch, setValue, formState: { errors } } = usePersistentForm<FormData>('kycBaseInfo', {
      gendar: 0,
      type: 0,
      employment: 1,
      source: 1,
      issueCountry: 'CHN'
    });
    const type = watch('type')
    const useCertificateAddress = watch('useCertificateAddress')
    const employment = watch('employment')

    const [submiting, setSubmiting] = useState(false)
    
    const onSubmit = async (data: FormData) => {
      // 1. 判断有没有上传证件照
      const kycFiles = storage.getItem(KYC_UPLOAD_STORAGE_KEY) || {}   
      if (type === 0) { // 身份证，正反面都要传
        if (!kycFiles.idFront) {
          toastError({title: '请上傳人像頁'})
          return
        }
        if (!kycFiles.idBack) {
          toastError({title: '请上傳國徽面'})
          return
        }
      }
      if (type === 1) { // 只判断护照
        if (!kycFiles.passport) {
          toastError({title: '请上傳护照'})
          return
        }
      }
      // 无地址证明
      if (!kycFiles.addressCertificates) {
        toastError({title: '上傳地址證明'})
        return
      }
      const params: IKycSubmitData = {
        basicInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: data.fullName,
          gender: data.gendar,
          dob: data.dob,
          email: data.email
        },
        idInfo: {
          type: data.type,
          issueCountry: data.issueCountry,
          no: data.no,
          residentAddress: data.useCertificateAddress ? '' : data.residentAddress,
          useCertificateAddress: data.useCertificateAddress,
          files: {
            idCardFront: data.type === 0 ? kycFiles.idFront : '',
            idCardBack: data.type === 0 ? kycFiles.idBack : '',
            idCard: data.type === 0 ? kycFiles.idMerged : '',
            passport: data.type === 0 ? '' : kycFiles.passport,
            addressCertification: kycFiles.addressCertificates
          }
        },
        workInfo: {
          employment: data.employment,
          description: data.description
        },
        incomeInfo: {
          source: data.source || 1
        },
        extraInfo: {
          incomeCertifications: kycFiles.incomeCertificates || []
        },
        approvedProtocols: [
          "AML-Policy-v3.0",
          "Privacy-Agreement-v2.1"
        ]
      }
      console.log(data)
      console.log(params)
      console.log(submiting)
      if (submiting) return
      setSubmiting(true)
      const res = await kycApi.submitKyc(params)
      setSubmiting(false)
      if (res?.code === RESPONSE_CODE.SUCCESS) {
        toastSuccess({title: '提交成功'})
      } else {
        toastError({title: res?.message || '提交失败'})
      }
      
    }

    useEffect(() => {
      const dateOptions = calcYearDate()
      setDateOptions(dateOptions)
      setValue('dob', format(dateOptions.maxDate, FormatStr))
    }, [])


    return (
      <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-2">
        <SectionBox>
          <SectionTitle>{t('kyc.t2')}</SectionTitle>
          <div className=" grid grid-cols-4 font-normal gap-x-6">
            <FormItemBox>
              <FormItemLabel title={t('kyc.t3')} />
              <InputBox >
                <KycInput 
                  className=""
                  placeholder={t('kyc.t4')}
                  error={errors.firstName?.message}
                  {
                    ...register("firstName", {
                      required: '最大支持输入30位字符',
                      maxLength: {
                        value: 30,
                        message: "最大支持输入30位字符"
                      },
                      pattern: {
                        value: /^[a-zA-Z\u4e00-\u9fa5]+$/,
                        message: "只支持中文和英文字母"
                      },
                      onChange: (e) => {
                        console.log(e.target.value)
                        // 实时限制输入长度
                        if (e.target.value.length > 30) {
                          e.target.value = e.target.value.slice(0, 30);
                        }
                      }
                    })
                    
                  }
                />
                <ErrorBox error={errors.firstName?.message}/>
              </InputBox>
            </FormItemBox>
            <FormItemBox>
              <FormItemLabel title={t('kyc.t5')} />
              <InputBox >
                <KycInput 
                  className=""
                  placeholder={t('kyc.t4')}
                  error={errors.lastName?.message}
                  {
                    ...register("lastName", {
                      required: '最大支持输入30位字符',
                      maxLength: {
                        value: 30,
                        message: "最大支持输入30位字符"
                      },
                      pattern: {
                        value: /^[a-zA-Z\u4e00-\u9fa5]+$/,
                        message: "只支持中文和英文字母"
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
                <ErrorBox error={errors.lastName?.message}/>
              </InputBox>
            </FormItemBox>
            <div className=" col-span-2">
              <FormItemBox>
              <FormItemLabel title={t('kyc.t6')} />
              <InputBox >
                <KycInput 
                  className=""
                  placeholder={t('kyc.t4')}
                  error={errors.fullName?.message}
                  {
                    ...register("fullName", {
                      required: '最大支持输入30位字符',
                      maxLength: {
                        value: 30,
                        message: "最大支持输入30位字符"
                      },
                      pattern: {
                        value: /^[a-zA-Z\u4e00-\u9fa5·\s_-]+$/,
                        message: "只支持中文和英文字母"
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
                <ErrorBox error={errors.fullName?.message}/>
              </InputBox>
            </FormItemBox>
            </div>
            
            
          </div>
          <div className=" grid grid-cols-3 font-normal gap-x-6">
            {/* 性别 */}
            <FormItemBox>
              <FormItemLabel title={t('kyc.t7')} />
              <InputBox >
                <Select 
                  activeColor="#FFFFFF"
                  className="h-[44px] rounded-[6px]"
                  placeholder={t('identity.select')}
                  data={genderList}
                  defaultValue={'0'}
                  onChange={data => {
                    console.log(data)
                    setValue('gendar', Number(data.value))
                  }}
                />
              </InputBox>
            </FormItemBox>
            {/* 出生日期 */}
            <FormItemBox>
              <FormItemLabel title={t('kyc.t8')} />
              <InputBox >
                <div className="bg-[rgba(255,255,255,0.08)] rounded-[6px]">
                  <DatePicker
                    captionLayout="dropdown"
                    minDate={dateOptions.minDate}
                    maxDate={dateOptions.maxDate}
                    activeColor="#FFFFFF"
                    className="h-[44px]"
                    placeholder={t('identity.selectDate')}
                    userSelectedDate={dateOptions.defaultDate} 
                    onUserSelectedDateChanged={(value) => {
                      if (value) {
                        setValue('dob', format(value, FormatStr)) 
                      }
                      
                    }} 
                  />
                </div>
              </InputBox>
            </FormItemBox>
            {/* 邮箱 */}
            <FormItemBox>
              <FormItemLabel title={t('kyc.t9')} />
              <InputBox >
                <KycInput 
                  className=""
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
        </SectionBox>
        <SectionBox>
          <SectionTitle>{t('kyc.t10')}</SectionTitle>
          <div className=" grid grid-cols-3 font-normal gap-x-6">
            {/* 证件类型 */}
            <FormItemBox>
              <FormItemLabel title={t('kyc.t11')} />

              <InputBox >
                <DoctypeSelect
                  defaultValue={String(type)} 
                  onChange={data => {
                    console.log(data)
                    setValue('type', Number(data.code))
                  }}
                />
              </InputBox>
            </FormItemBox>
            <FormItemBox>
              <FormItemLabel title={t('kyc.t12')} />
              {/* 证件签发国 */}
              <InputBox >
                <CountrySelect 
                  onChange={data => {
                    setValue('issueCountry', data.key)
                  }}
                />
              </InputBox>
            </FormItemBox>
            <FormItemBox>
              <FormItemLabel title={t('kyc.t13')} />
              {/* 证件号码 */}
              <InputBox >
                <KycInput 
                  className=""
                  placeholder={t('kyc.t4')}
                  error={errors.no?.message}
                  {
                    ...register("no", {
                      required: '请输入内容',
                      maxLength: {
                        value: 30,
                        message: "最大支持输入30位字符"
                      },
                      pattern: {
                        value: /^[A-Za-z0-9]+$/,
                        message: "仅支持数字字母输入"
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
                <ErrorBox error={errors.no?.message}/>
              </InputBox>
            </FormItemBox>  
          </div>
          
          <div className=" grid grid-cols-1 font-normal">
            <FormItemBox>
              <FormItemLabel title={t('kyc.t14')} />
              <div className="mt-3 flex gap-x-2 items-center mb-3">
                <CheckBox 
                  onChange={v => {
                    setValue('useCertificateAddress', v)
                  }}
                />
                <div className="text-[rgba(255,255,255,0.6)] text-[16px]">
                  {t('kyc.t15')}
                </div>
              </div>
              {
                !useCertificateAddress && 
                  <InputBox >
                    <KycInput 
                      className=""
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
              }
              
            </FormItemBox>      
          </div>
        </SectionBox>
        
        <SectionBox className="pb-5">
          <div className=" flex items-center">
            <SectionTitle>{t('identity.upload.uploadId')}</SectionTitle>
            <span className='text-[#CA3F64] ml-1 flex items-center'>*</span>
          </div>
          
          {/* 上传证件 */}
          <Upload type={type === 1 ? 'passport' : 'identity'} />
        </SectionBox>  
        <SectionBox className="pb-5">
          {/* 上传地址证明 */}
          <Upload type="address" />
        </SectionBox> 
        <SectionBox>
          <SectionTitle>{t('kyc.t16')}</SectionTitle>
          <div className=" grid grid-cols-3 font-normal gap-x-6">
            {/* 就业状况 */}
            <FormItemBox>
              <FormItemLabel title={t('kyc.t17')} />
              <InputBox >
                <EmploymentSelect 
                  onChange={data => {
                    setValue('employment', Number(data.code))
                  }}
                />
              </InputBox>
            </FormItemBox>
            <div className=" col-span-2">
              {
                employment === 4 && 
                <FormItemBox>
                  <FormItemLabel title={t('kyc.t23')} />
                  <InputBox >
                    <KycInput 
                      className=""
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
              }
            </div>
            
          </div>
        </SectionBox>
        <SectionBox>
          <SectionTitle>{t('kyc.t21')}</SectionTitle>
          <div className=" grid grid-cols-2 font-normal gap-x-6">
            {/* 收入类型 */}
            <FormItemBox>
              <FormItemLabel title={t('kyc.t22')} />
              <InputBox >
                <IncomeSelect 
                  onChange={data => {
                    setValue('source', Number(data.code))
                  }}
                />
              </InputBox>
            </FormItemBox>
            
          </div>
          
        </SectionBox>
        <SectionBox>
          <SectionTitle>{t('kyc.t19')}</SectionTitle>
          <div className="h-5"></div>
          <Upload type="extra" />
          <div className="flex items-center text-base text-[#909090]">
            <span className="text-[#CA3F64] mr-1 flex items-center">*</span>
            {t('kyc.t20')}
          </div>
        </SectionBox>

        <div className="mt-8 flex gap-x-2 items-start">
          <div className=" shrink-0 relative top-[2px]">
            <CheckBox />
          </div>
          <div className="text-[rgba(255,255,255,0.6)] text-[16px]">
            {t('identity.aggree1')}<a href="" target="_blank" className="text-[rgba(26,133,255,1)]">{t('identity.aggree3')}</a>{t('identity.aggree2')}
          </div>
        </div>
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

export { BaseInfo }