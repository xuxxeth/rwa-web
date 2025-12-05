

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { memo, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { kycApi } from "@/service/kyc/api";
import { RESPONSE_CODE } from "@/config/constants";
import type { ISupportedCountry } from "@/service/kyc/types";

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
}

const CountrySelect = memo(
  ({
    defaultValue,
    value, 
    onChange, 
    className
  }: CountrySelectProps) => {
    const [countryList, setCountryList] = useState<ISupportedCountry[]>([])
    const [currentCode, setCurrentCode] = useState('')
    const [currentCountry, setCurrentCountry] = useState<ISupportedCountry>({key: '', value: ''})
    const [open, setOpen] = useState(false)


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


    useEffect(() => {
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
              <>
                {/* <span className=" text-[24px]">{currentCountry.icon}</span> */}
                <span className=" font-normal md:text-[16px]">{currentCountry.value}</span>
              </>
            ) : (
              <span className="md:text-[1.04vw] text-5">Select Country</span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className=" border-none">
          {countryList.map(code => (
            <SelectItem key={code.key} value={code.key}>
              <div className="flex items-center justify-between w-full gap-2 text-white text-[16px]">
                <div>
                  {/* <span className=" text-[20px]">{code.icon}</span> */}
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
        </SelectContent>
      </Select>
    )
  }
)

export { CountrySelect }



