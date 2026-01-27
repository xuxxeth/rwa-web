

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { memo, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { kycApi } from "@/service/kyc/api";
import { RESPONSE_CODE } from "@/config/constants";
import type { ISupportedCountry } from "@/service/kyc/types";
import { LazyImage } from "../image/LazyImage";
import { useTranslation } from "@/hooks/useTranslation";

export type ICountryCode = {
  code: string,
  icon: string,
  en: string,
  cn: string
}

export type CountrySelectProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (code: ISupportedCountry) => void;
  className?: string
  placeHolder?: string
}

const pngCode = ['SAU']

const CountrySelect = memo(
  ({
    defaultValue,
    value, 
    onChange, 
    className,
    placeHolder
  }: CountrySelectProps) => {
    const { t } = useTranslation()
    const [countryList, setCountryList] = useState<ISupportedCountry[]>([])
    const [currentCode, setCurrentCode] = useState('')
    const [currentCountry, setCurrentCountry] = useState<ISupportedCountry>({key: '', value: ''})
    const [open, setOpen] = useState(false)
    const [searchText, setSearchText] = useState('')

    useEffect(() => {
      if (defaultValue && countryList.length > 0) {
        setCurrentCode(defaultValue)
        const _country = countryList.find(country => country.key === defaultValue) || countryList[0]
        if (_country) {
          setCurrentCountry(_country)
          onChange && onChange(_country)
          if (!defaultValue) {
            setCurrentCode(_country.key)
          }
        }
      }
    }, [defaultValue, countryList.length]) 

    const fetchedRef = useRef(false)
    useEffect(() => {
      if (fetchedRef.current) return
      fetchedRef.current = true
      kycApi.getSupportedCountries()
        .then(res => {
          if (res.code === RESPONSE_CODE.SUCCESS) {
            const _list = res.data || []
            setCountryList(_list)
            if (_list[0]) {
              setCurrentCode(_list[0].key)
              setCurrentCountry(_list[0])
            }
          }
        })
    }, [])

    return (
      <Select 
        value={value} 
        onOpenChange={open => {
          setOpen(open)
        }}
        onValueChange={(en) => {
          if (en) {
            setCurrentCode(en)
            const _country = countryList.find(country => country.key === en)
            if (_country) {
              setCurrentCountry(_country)
              onChange && onChange(_country)
            }
          }
          
        }}
      >
        <SelectTrigger 
          open={open}
          className={cn(
            "px-4 py-0 h-[44px] shadow-none flex items-center justify-between rounded-[8px] bg-[rgba(255,255,255,0.08)] border border-solid border-[rgba(255,255,255,0)]",
            className,
            open ? 'border-[#ffffff]' : ''
          )}
        >
          <div className="flex items-center gap-2 w-[70px] text-white">
            {currentCode ? (
              <div className=" flex items-center gap-x-2">
                {/* <span className=" text-[24px]">{currentCountry.icon}</span>
                <div className="w-6 h-6 flex items-center justify-center">
                  <LazyImage src={`/images/country/${currentCountry.key}.${ pngCode.includes(currentCountry.key) ? 'png' : 'svg'}`} className="w-6" />
                </div> */}
                <span className=" font-normal md:text-[16px]">{currentCountry.value}</span>
              </div>
            ) : (
              <span className="md:text-[1.04vw] text-5">{placeHolder || 'Please select'} </span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className="border-none p-0">
          <div className="sticky top-0 z-50 p-2 border-b border-[rgba(255,255,255,0.1)]">
            <input 
              type="text"
              placeholder={t('kyc.t4')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="text-[14px] w-full px-3 py-2 rounded-[6px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] text-white placeholder-[#9DA3AF] focus:outline-none focus:border-white"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {countryList
              .filter(code => 
                code.value.toLowerCase().includes(searchText.toLowerCase()) || 
                code.key.toLowerCase().includes(searchText.toLowerCase())
              )
              .map(code => (
            <SelectItem key={code.key} value={code.key}>
              <div className="flex items-center justify-between w-full gap-2 text-white text-[16px]">
                <div className=" flex items-center gap-x-2">
                  {/* 
                  <div className="w-6 h-6 flex items-center justify-center">
                    <LazyImage src={`/images/country/${code.key}.${ pngCode.includes(code.key) ? 'png' : 'svg'}`} className="w-6" />
                  </div>
                  */}
                  <span>{code.value}</span>
                </div>
                <span
                  className="ml-auto data-[state=checked]:block hidden text-[#9CFF3A]"
                  data-state={code.key === currentCode ? 'checked' : ''}
                >
                  <Check className="h-4 w-4 text-white" />
                </span>
              </div>
            </SelectItem>
              ))}
          </div>
        </SelectContent>
      </Select>
    )
  }
)

export { CountrySelect }



