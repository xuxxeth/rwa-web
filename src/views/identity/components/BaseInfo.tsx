import { CheckBox, CheckBoxBySVG } from "@/components/check-box"
import { CountrySelect } from "@/components/country-select"
import { DatePicker } from "@/components/date-range-picker"
import { DoctypeSelect } from "@/components/doctype-select"
import { LazyImage } from "@/components/image/LazyImage"
import { KycInput } from "@/components/input/KycInput"
import { Select } from "@/components/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePersistentForm } from "@/hooks/usePersistentForm"
import { useTranslation } from "@/hooks/useTranslation"
import { memo, useMemo, useState } from "react"
import { Upload } from "./Upload"
import { cn } from "@/utils/tw"
import { EmploymentSelect } from "@/components/employment-select"
import { IncomeSelect } from "@/components/income-select"

const genderList = [
  {value: '1', label: 'Male'},
  {value: '0', label: 'Female'},

]
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

  // 工作信息
  currentEmployment: string;
  description: string;

  // 补充信息

}

const BaseInfo = memo(
  () => {
    const { t } = useTranslation()
    const { register, handleSubmit, watch, formState: { errors } } = usePersistentForm<FormData>('kycBaseInfo', {
      gendar: 0
    });

    const [gendar, setGendar] = useState('0')
    const [issueCountry, setIssueCountry] = useState('')
    
    const firstName = watch('firstName' );
    const lastName = watch('lastName');

    const fullName = useMemo(() => {
      const first = firstName || '';
      const last = lastName || '';
      return `${first} ${last}`.trim();
    }, [firstName, lastName])

    const onSubmit = (data: FormData) => {
      console.log(data)
    }

    console.log(errors)

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
                      required: '请输入内容',
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
                      required: '请输入内容',
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
                      required: '请输入内容',
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
                    setGendar(data.value)
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
                    activeColor="#FFFFFF"
                    className="h-[44px]"
                    placeholder={t('identity.selectDate')}
                    userSelectedDate={new Date().getTime()} 
                    onUserSelectedDateChanged={(value) => {
                      console.log(value)
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
                      required: '请输入内容',
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
                <DoctypeSelect />
              </InputBox>
            </FormItemBox>
            <FormItemBox>
              <FormItemLabel title={t('kyc.t12')} />
              <InputBox >
                <CountrySelect 
                  onChange={data => {
                    console.log(data)
                    setIssueCountry(data.code)
                  }}
                />
              </InputBox>
            </FormItemBox>
            <FormItemBox>
              <FormItemLabel title={t('kyc.t13')} />
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
                <ErrorBox error={errors.no?.message}/>
              </InputBox>
            </FormItemBox>  
          </div>
          
          <div className=" grid grid-cols-1 font-normal">
            <FormItemBox>
              <FormItemLabel title={t('kyc.t14')} />
              <div className="mt-3 flex gap-x-2 items-center mb-3">
                  <CheckBox />
                <div className="text-[rgba(255,255,255,0.6)] text-[16px]">
                  {t('kyc.t15')}
                </div>
              </div>
              <InputBox >
                <KycInput 
                  className=""
                  placeholder={t('kyc.t4')}
                  error={errors.residentAddress?.message}
                  {
                    ...register("no", {
                      required: '请输入内容',
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
                <ErrorBox error={errors.residentAddress?.message}/>
              </InputBox>
            </FormItemBox>      
          </div>
        </SectionBox>
        
        <SectionBox className="pb-5">
          {/* 上传证件 */}
          <Upload type="identity" />
        </SectionBox>  
        <SectionBox className="pb-5">
          {/* 上传地址证明 */}
          <Upload type="address" />
        </SectionBox> 
        <SectionBox>
          <SectionTitle>{t('kyc.t16')}</SectionTitle>
          <div className=" grid grid-cols-2 font-normal gap-x-6">
            {/* 就业状况 */}
            <FormItemBox>
              <FormItemLabel title={t('kyc.t17')} />
              <InputBox >
                <EmploymentSelect />
              </InputBox>
            </FormItemBox>
          </div>
          
        </SectionBox>
        <SectionBox>
          <SectionTitle>{t('kyc.t21')}</SectionTitle>
          <div className=" grid grid-cols-2 font-normal gap-x-6">
            {/* 收入类型 */}
            <FormItemBox>
              <FormItemLabel title={t('kyc.t22')} />
              <InputBox >
                <IncomeSelect />
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
          <Button type="submit" disabled className="bg-white text-black w-full lg:w-[400px] rounded-[8px]"
          >
            { t('identity.continue') }
            
          </Button>
        </div>

      </form>
    )
  }
)

export { BaseInfo }