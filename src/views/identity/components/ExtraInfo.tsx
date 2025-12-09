import { Button } from "@/components/ui/button"
import { usePersistentForm } from "@/hooks/usePersistentForm"
import { useTranslation } from "@/hooks/useTranslation"
import { memo, useId, useState } from "react"
import { Upload } from "./Upload"
import storage from "@/utils/storage"
import { KYC_UPLOAD_STORAGE_KEY } from "./Upload/shared"
import { useToast } from "@/hooks/useToast"
import { kycApi } from "@/service/kyc/api"
import type { IKycSubmitData } from "@/service/kyc/types"
import { RESPONSE_CODE } from "@/config/constants"
import { ErrorBox, InputBox, SectionBox, SectionTitle } from "./BaseInfo"
import { LazyImage } from "@/components/image/LazyImage"
import { KycInput } from "@/components/input/KycInput"
import { KycTextarea } from "@/components/input/KycTextArea"
import { useFieldArray } from "react-hook-form"

export type IExtraInfoItem = {
  name: string,
  files?: string[],
  description?: string
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
  extraList: IExtraInfoItem[]

}

const ExtraInfo = memo(
  () => {
    const { t } = useTranslation()
    const { toastSuccess, toastError  } = useToast()
    const { register, handleSubmit, watch, control, setValue, formState: { errors } } = usePersistentForm<FormData>('kycBaseInfo', {
      extraList: [
        { name: "", description: "", files: [] }
      ]
    });
    const _id = useId()
    const { fields, append, remove } = useFieldArray({
      control,
      name: "extraList"
    });
    const type = watch('type')
    const [extraList, setExtraList] = useState<IExtraInfoItem[]>([{name: '', files: [], description: ''}])

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

    const handlePlus = async (action: string, index: number) => {

    }

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-2">
        
        {/* <SectionBox className="pb-5"> */}
          <SectionTitle>{t('kyc.t25')}</SectionTitle>
          <div className="bg-[#0E0E0E] rounded-[4px] flex items-center px-[24px] py-[12px] my-5">
            {t('kyc.t26')}
          </div>
          {
            fields.map((item, index) => {
              return (
                <div key={`${_id}-${index}`} className=" flex justify-between mb-5">
                  <SectionBox className="p-4 w-full"> 
                    <div className=" grid grid-cols-2 mb-5">
                      <div>
                        <div className="flex items-end justify-between font-normal mb-2">
                          <div className="text-[16px]">資料名稱 </div>
                          <div className="text-[12px] text-[#909090]">0/30</div>
                        </div>
                        <InputBox >
                          <KycInput 
                            className=""
                            placeholder={t('kyc.t4')}
                            error={errors.extraList?.[index]?.name?.message}
                            {
                              ...register(`extraList.${index}.name`, {
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
                          <ErrorBox error={errors.extraList?.[index]?.name?.message}/>
                        </InputBox>
                      </div>
                    </div>
                    <div className="font-normal mb-2">
                      <div className="text-[16px]">資料图片 </div>
                      <div className="text-[16px] text-[rgba(255,255,255,0.6)] mt-2">
                        上傳圖片說明：支援 JPG/PNG/PDF，單張不超過 2MB；多頁請分次上傳並確保清晰可讀。
                      </div>
                    </div>
                    <Upload type="extra" />
                    <div className="font-normal my-5">
                      <div className="text-[16px]">資料说明 </div>
                    </div>
                    <InputBox>
                      <KycTextarea placeholder="请输入" 
                        {
                          ...register(`extraList.${index}.description`)
                        }
                      />
                    </InputBox>
                    
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
            { '提交資料' }
            
          </Button>
        </div>

      </form>
    )
  }
)

export { ExtraInfo }