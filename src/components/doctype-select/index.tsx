

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { memo, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { LazyImage } from "../image/LazyImage";
import { id } from "date-fns/locale";

export type IDoctypeCode = {
  code: string,
  icon: string,
  label: string,
}

export type DoctypeSelectProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (code: IDoctypeCode) => void;
  className?: string
  countryCode?: string
}

const DoctypeSelect = memo(
  ({
    defaultValue,
    value, 
    onChange, 
    className,
    countryCode
  }: DoctypeSelectProps) => {
    const { t, i18n } = useTranslation()
    const idList = useMemo(() => {
      return countryCode === 'CHN' ? [
        { code: '0', label: t('identity.identityCard'), icon: '/images/icons/identity/id.png' },
        { code: '1', label: t('identity.passport'), icon: '/images/icons/identity/passport.png' },
      ] : [
        { code: '1', label: t('identity.passport'), icon: '/images/icons/identity/passport.png' },
      ]
    }, [t, countryCode]) 
    
    const [currentCode, setCurrentCode] = useState(idList[0].code)
    const [currentDoctype, setCurrentDoctype] = useState(idList[0])
    const [open, setOpen] = useState(false)

    useEffect(() => {
      if (defaultValue) {
        setCurrentCode(defaultValue)
        const _id = idList.find(id => id.code === defaultValue)
        if (_id) {
          setCurrentDoctype(_id)
        }
      }
    }, [defaultValue, countryCode, i18n.language]) 

    return (
      <div 
        className={cn(
          "px-3 py-0 h-[38px] shadow-none flex items-center justify-between rounded-[4px] bg-[#1A1B1E] border border-solid border-[rgba(255,255,255,0)]",
          className,
          open ? 'border-[#ffffff]' : ''
        )}
      >
        <div className="flex items-center gap-2 w-[70px] text-white">
          {currentCode ? (
            <>
              <LazyImage className="w-5" src={currentDoctype.icon} />
              <span className=" font-normal md:text-[14px]">{currentDoctype.label}</span>
            </>
          ) : (
            <span className="md:text-[14px] text-5">{''}</span>
          )}
        </div>
      </div>
    )

    return (
      <Select 
        value={value} 
        onOpenChange={open => {
          // setOpen(open)
        }}
        onValueChange={(code) => {
          if (code) {
            setCurrentCode(code)
            const _id = idList.find(id => id.code === code)
            if (_id) {
              setCurrentDoctype(_id)
              onChange && onChange(_id)
            }
          }
          
        }}
      >
        <SelectTrigger 
          open={open}
          className={cn(
            "px-3 py-0 h-[38px] shadow-none flex items-center justify-between rounded-[4px] bg-[#1A1B1E] border border-solid border-[rgba(255,255,255,0)]",
            className,
            open ? 'border-[#ffffff]' : ''
          )}
        >
          <div className="flex items-center gap-2 w-[70px] text-white">
            {currentCode ? (
              <>
                <LazyImage className="w-5" src={currentDoctype.icon} />
                <span className=" font-normal md:text-[14px]">{currentDoctype.label}</span>
              </>
            ) : (
              <span className="md:text-[14px] text-5">{''}</span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className=" ">
          {idList.map(id => (
            <SelectItem key={id.code} value={id.code}>
              <div className="flex items-center justify-between w-full gap-2 text-white text-[16px]">
                <div className=" flex items-center  gap-x-2">
                  <LazyImage className="w-6 h-6" src={id.icon} />
                  <span>{id.label}</span>
                </div>
                <span
                  className="ml-auto data-[state=checked]:block hidden text-[#9CFF3A]"
                  data-state={id.code === currentCode ? 'checked' : ''}
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

export { DoctypeSelect }



