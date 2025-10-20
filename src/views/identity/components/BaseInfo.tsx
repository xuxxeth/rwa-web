import { CheckBox, CheckBoxBySVG } from "@/components/check-box"
import { CountrySelect } from "@/components/country-select"
import { DatePicker } from "@/components/date-range-picker"
import { DoctypeSelect } from "@/components/doctype-select"
import { LazyImage } from "@/components/image/LazyImage"
import { Select } from "@/components/select"
import { Button } from "@/components/ui/button"
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
      <form>
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
            <div className="bg-[rgba(255,255,255,0.08)] rounded-[6px]">
              <DatePicker 
                placeholder={t('identity.selectDate')}
                userSelectedDate={new Date().getTime()} 
                onUserSelectedDateChanged={() => {

                }} 
              />
            </div>
            
          </div>
          <div>
            <div className="mb-2 text-[16px]">{t('identity.gender')}</div>
            <Select 
              placeholder={t('identity.select')}
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
        <Button className="bg-white text-black w-full mt-8"
          onClick={async () => {
            
          }}
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