import { CheckBox, CheckBoxBySVG } from "@/components/check-box"
import { CountrySelect } from "@/components/country-select"
import { Select } from "@/components/select"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/hooks/useTranslation"
import { memo } from "react"

const genderList = [
  {value: '1', label: 'Male'},
  {value: '0', label: 'Female'},

]

export const InputBox = ({ children }: { children: React.ReactNode}) => {
  return (
    <div className="bg-[rgba(255,255,255,0.08)] px-4 rounded-[6px] text-[16px] h-[56px] flex items-center">
      { children }
    </div>
  )
}

const BaseInfo = memo(
  () => {
    const { t } = useTranslation()
    
    return (
      <div>
        <div className=" grid grid-cols-3 font-normal gap-x-6">
          <div>
            <div className="mb-2 text-[16px]">{t('identity.firstName')}</div>
            <InputBox >
              <Input className=""
                placeholder={t('identity.firstName')}
              />
            </InputBox>
            
          </div>
          <div>
            <div className="mb-2 text-[16px]">{t('identity.lastName')}</div>
            <InputBox >
              <Input className=""
                placeholder={t('identity.lastName')}
              />
            </InputBox>
            
          </div>
          <div>
            <div className="mb-2 text-[16px]">{t('identity.fullName')}</div>
            <InputBox >
              <Input className=""
                placeholder={t('identity.fullName')}
              />
            </InputBox>
            
          </div>
        </div>
        <div className=" grid grid-cols-2 gap-x-6 mt-8">
          <div>
            <div className="mb-2 text-[16px]">{t('identity.DOB')}</div>
            <InputBox >
              {''}
            </InputBox>
          </div>
          <div>
            <div className="mb-2 text-[16px]">{t('identity.gender')}</div>
            <Select 
              
              data={genderList}
            />
          </div>
        </div>
        <div className=" grid grid-cols-2 gap-x-6 mt-8">
          <div>
            <div className="mb-2 text-[16px]">{t('identity.issuingCountry')}</div>
              <CountrySelect />
          </div>
          <div>
            <div className="mb-2 text-[16px]">{t('identity.documentType')}</div>
            <InputBox >
              {''}
            </InputBox>
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
            我已阅读并同意 <a href="" target="_blank" className="text-[rgba(26,133,255,1)]">《反洗钱与反恐怖融资政策（AML/CFT）》</a>，并同意为KYC/制裁筛查与合规审查之目的处理与共享必要信息。
          </div>
        </div>
      </div>
    )
  }
)

export { BaseInfo }