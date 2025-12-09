import { LazyImage } from "@/components/image/LazyImage"
import { Button } from "@/components/ui/button"
import { usePersistentForm } from "@/hooks/usePersistentForm"
import { useTranslation } from "@/hooks/useTranslation"
import { memo, useState } from "react"
import { Upload } from "./Upload"
import { cn } from "@/utils/tw"
import storage from "@/utils/storage"
import { KYC_UPLOAD_STORAGE_KEY } from "./Upload/shared"
import { useToast } from "@/hooks/useToast"
import { kycApi } from "@/service/kyc/api"
import type { IKycSubmitData } from "@/service/kyc/types"
import { RESPONSE_CODE } from "@/config/constants"
import { SectionBox, SectionTitle } from "./BaseInfo"
import {
  Text,
} from './Upload/shared'

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

const Risk3Info = memo(
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

    });
    const type = watch('type')

    const [submiting, setSubmiting] = useState(false)
    
    const onSubmit = async (data: FormData) => {
      // 1. 判断有没有上传证件照
      const kycFiles = storage.getItem(KYC_UPLOAD_STORAGE_KEY) || {}   
      
      // 无地址证明
      if (!kycFiles.incomeCertificates || kycFiles.incomeCertificates.length < 0) {
        toastError({title: '上傳收入證明'})
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


    return (
      <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-2">
        
        <SectionBox>
          <SectionTitle>{t('kyc.t19')}</SectionTitle>
          <div className="my-5">
            <Text text='uploadIncome' className=' text-white' />
            <Text text='extraTips' className='text-sm mt-2' />
          </div>
          <Upload type="extra" />
          
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