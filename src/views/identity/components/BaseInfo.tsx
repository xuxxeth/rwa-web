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

export const SectionBox = ({ children }: { children: React.ReactNode}) => {
  return (
    <div className="p-5 bg-[#0E0E0E] rounded-[4px]">
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
  // fullName: string;
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
          <div className=" grid grid-cols-3 font-normal gap-x-6">
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
              <FormItemLabel title={t('kyc.t6')} />
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
          </div>
        </SectionBox>

        <div className=" grid grid-cols-2 gap-x-6 mt-8">
          <div>
            <div className="mb-2 text-[16px]">{t('identity.DOB')}</div>
            <div className="bg-[rgba(255,255,255,0.08)] rounded-[6px]">
              <DatePicker 
                placeholder={t('identity.selectDate')}
                userSelectedDate={new Date().getTime()} 
                onUserSelectedDateChanged={(value) => {
                  console.log(value)
                }} 
              />
            </div>
            
          </div>
          <div>
            <div className="mb-2 text-[16px]">{t('identity.gender')}</div>
            <Select 
              placeholder={t('identity.select')}
              data={genderList}
              defaultValue={'0'}
              onChange={data => {
                setGendar(data.value)
              }}
            />
          </div>
        </div>
        <div className=" grid grid-cols-2 gap-x-6 mt-8">
          <div>
            <div className="mb-2 text-[16px]">{t('identity.issuingCountry')}</div>
              <CountrySelect 
                onChange={data => {
                  console.log(data)
                  setIssueCountry(data.code)
                }}
              />
          </div>
          <div>
            <div className="mb-2 text-[16px]">{t('identity.documentType')}</div>
            <DoctypeSelect />
          </div>
        </div>
        <div className="mt-8">
          <div className="mb-2 text-[16px]">{t('identity.cardId')}</div>
          <InputBox >
            <Input className=""
              placeholder={t('identity.cardId')}
            />
          </InputBox>
        </div>
        <div className="mt-8">
          <div className="mb-2 text-[16px]">{t('identity.address')}</div>
          <InputBox >
            {''}
          </InputBox>
        </div>
        <div className="mt-8">
          <div className="mb-2 text-[16px]">{t('identity.detailedAddress')}</div>
          <InputBox >
            <Input className=""
              placeholder={t('identity.detailedAddress')}
            />
          </InputBox>
        </div>
        <div className="mt-8 flex gap-x-2 items-start">
          <div className=" shrink-0">
            <CheckBox />
          </div>
          <div className="text-[rgba(255,255,255,0.6)] text-[16px]">
            {t('identity.aggree1')}<a href="" target="_blank" className="text-[rgba(26,133,255,1)]">{t('identity.aggree3')}</a>{t('identity.aggree2')}
          </div>
        </div>
        <Button type="submit" className="bg-white text-black w-full mt-8"
          
        >
          { t('identity.continue') }
          
        </Button>
        <div className=" flex items-center gap-x-2 mt-8 justify-center">
          <LazyImage src="/images/icons/identity/secue.png" className="w-6 h-6" />
          <div className="text-[rgba(255,255,255,0.6)] text-[16px] font-normal">{t('identity.infoVerification')}</div>
        </div>
      </form>
    )
  }
)

export { BaseInfo }