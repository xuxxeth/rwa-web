

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { memo, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { LazyImage } from "../image/LazyImage";

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
}

const DoctypeSelect = memo(
  ({
    defaultValue,
    value, 
    onChange, 
    className
  }: DoctypeSelectProps) => {
    const { t } = useTranslation()
    const idList = [
      { code: '0', label: t('identity.identityCard'), icon: '/images/icons/identity/id.png' },
      { code: '1', label: t('identity.passport'), icon: '/images/icons/identity/passport.png' },
    ]
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
    }, [defaultValue]) 

    return (
      <Select 
        value={value} 
        onOpenChange={open => {
          setOpen(open)
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
            "px-4 py-0 h-[44px] shadow-none flex items-center justify-between rounded-[8px] bg-[rgba(255,255,255,0.08)] border border-solid border-[rgba(255,255,255,0)]",
            className,
            open ? 'border-[#ffffff]' : ''
          )}
        >
          <div className="flex items-center gap-2 w-[70px] text-white">
            {currentCode ? (
              <>
                <LazyImage className="w-6 h-6" src={currentDoctype.icon} />
                <span className=" font-normal md:text-[16px]">{currentDoctype.label}</span>
              </>
            ) : (
              <span className="md:text-[1.04vw] text-5">{''}</span>
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



