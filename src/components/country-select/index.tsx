

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { memo, useEffect, useState } from "react";
import { countryList } from "./countryList";
import { Check } from "lucide-react";

export type ICountryCode = {
  code: string,
  icon: string,
  en: string,
  cn: string
}

export type CountrySelectProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (code: ICountryCode) => void;
  className?: string
}

const CountrySelect = memo(
  ({
    defaultValue,
    value, 
    onChange, 
    className
  }: CountrySelectProps) => {
    const [currentCode, setCurrentCode] = useState(countryList[0].en)
    const [currentCountry, setCurrentCountry] = useState(countryList[0])
    const [open, setOpen] = useState(false)

    useEffect(() => {
      if (defaultValue) {
        setCurrentCode(defaultValue)
        const _country = countryList.find(country => country.en === defaultValue)
        if (_country) {
          setCurrentCountry(_country)
          onChange && onChange(_country)
        }
      }
    }, [defaultValue]) 

    return (
      <Select 
        value={value} 
        onOpenChange={open => {
          setOpen(open)
        }}
        onValueChange={(en) => {
          setCurrentCode(en)
          const _country = countryList.find(country => country.en === en)
          if (_country) {
            setCurrentCountry(_country)
            onChange && onChange(_country)
          }
        }}
      >
        <SelectTrigger 
          open={open}
          className={cn(
            "px-4 py-0 h-[56px] shadow-none flex items-center justify-between rounded-[8px] bg-[rgba(255,255,255,0.08)] border border-solid border-[rgba(255,255,255,0)]",
            className,
            open ? 'border-[rgba(156,255,58,0.5)]' : ''
          )}
        >
          <div className="flex items-center gap-2 w-[70px] text-white">
            {currentCode ? (
              <>
                <span className=" text-[24px]">{currentCountry.icon}</span>
                <span className=" font-normal md:text-[16px]">{currentCountry.en}</span>
              </>
            ) : (
              <span className="md:text-[1.04vw] text-5">Select Country</span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className=" border-none">
          {countryList.map(code => (
            <SelectItem key={code.en} value={code.en}>
              <div className="flex items-center justify-between w-full gap-2 text-white text-[16px]">
                <div>
                  <span className=" text-[20px]">{code.icon}</span>
                  <span>{code.en}</span>
                </div>
                <span
                  className="ml-auto data-[state=checked]:block hidden text-[#9CFF3A]"
                  data-state={code.en === currentCode ? 'checked' : ''}
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



