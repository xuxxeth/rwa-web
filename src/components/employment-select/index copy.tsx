

import { Select, SelectTrigger, SelectContent, SelectItem,  } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { memo, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export type IItemCode = {
  code: string,
  label: string,
}

export type EmploymentSelectProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (code: IItemCode) => void;
  className?: string
}

const EmploymentSelect = memo(
  ({
    defaultValue,
    value, 
    onChange, 
    className
  }: EmploymentSelectProps) => {
    const { t } = useTranslation()
    const dataList = [
      { code: '1', label: t('employment.t1')},
      { code: '2', label: t('employment.t2')},
      { code: '3', label: t('employment.t3')},
      { code: '4', label: t('employment.t4')},
    ]
    const [currentCode, setCurrentCode] = useState(dataList[0].code)
    const [currentItem, setCurrentItem] = useState(dataList[0])
    const [open, setOpen] = useState(false)

    useEffect(() => {
      if (defaultValue) {
        setCurrentCode(defaultValue)
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
            const _id = dataList.find(id => id.code === code)
            if (_id) {
              setCurrentItem(_id)
              onChange && onChange(_id)
            }
          }
          
        }}
      >
        <div className="border-[#1D1D1D] border rounded-[6px] px-4 py-0 h-[44px] flex items-center text-white">
          {currentCode ? (
            <span className=" font-normal md:text-[16px]">{currentItem.label}</span>
          ) : (
            <span className="md:text-[1.04vw] text-5">{''}</span>
          )}
        </div>
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
              <span className=" font-normal md:text-[16px]">{currentItem.label}</span>
            ) : (
              <span className="md:text-[1.04vw] text-5">{''}</span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className="">
          {dataList.map(id => (
            <SelectItem key={id.code} value={id.code}>
              <div className="flex items-center justify-between w-full gap-2 text-white text-[16px]">
                <div className=" flex items-center  gap-x-2">
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

export { EmploymentSelect }



