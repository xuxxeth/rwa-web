

import { Select, SelectTrigger, SelectContent, SelectItem,  } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { memo, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { LazyImage } from "../image/LazyImage";

export type IItemCode = {
  code: string,
  label: string,
}

export type EmploymentSelectProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (code: IItemCode) => void;
  className?: string
  mode?: string
  label?: string
}

const EmploymentSelect = memo(
  ({
    defaultValue,
    value, 
    onChange, 
    className,
    mode,
    label
  }: EmploymentSelectProps) => {
    const { t, i18n } = useTranslation()
    const dataList = [
      { code: '1', label: t('employment.t1')},
      { code: '2', label: t('employment.t2')},
      { code: '3', label: t('employment.t3')},
      { code: '4', label: t('employment.t4')},
    ]
    const [currentCode, setCurrentCode] = useState(dataList[0].code)
    const [currentItem, setCurrentItem] = useState(dataList[0])
    const [open, setOpen] = useState(false)
    const [canEdit, setCanEdit] = useState(false)

    useEffect(() => {
      if (defaultValue) {
        setCurrentCode(defaultValue)
        const _id = dataList.find(id => id.code === defaultValue)
        if (_id) {
          setCurrentItem(_id)
          onChange && onChange(_id)
        }
      }
    }, [defaultValue, i18n.language]) 

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
        {
          mode === 'view' &&
          <div className="text-[14px] font-normal text-[#909090] mb-2 flex items-center">
            {label || ''}
            <div className="ml-4 flex items-center gap-x-1 cursor-pointer"
              onClick={() => {
                setCanEdit(true)
              }}
            >
              <LazyImage src="/images/kyc/edit.png" className="w-[18px] h-[18px]" />
              <span className="text-[#2962FF]">编辑</span>
            </div>
          </div>
        }
        {
          mode === 'view' && !canEdit ? 
          <>
            
            <div className="border-[#1D1D1D] border rounded-[4px] px-3 py-0 h-[38px] flex items-center text-white">
              {currentCode ? (
                <span className=" font-normal md:text-[14px]">{currentItem.label}</span>
              ) : (
                <span className="md:text-[14px] text-5">{''}</span>
              )}
            </div> 
          </>
          : 
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
                <span className=" font-normal md:text-[14px]">{currentItem.label}</span>
              ) : (
                <span className="md:text-[14px] text-5">{''}</span>
              )}
            </div>
          </SelectTrigger>
        }
        
        
        <SelectContent className="">
          {dataList.map(id => (
            <SelectItem key={id.code} value={id.code} className="h-[34px]">
              <div className="flex items-center justify-between w-full gap-2 text-white text-[14px]">
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



