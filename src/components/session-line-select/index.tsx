

import { Select, SelectTrigger, SelectContent, SelectItem,  } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { memo, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export type IItemCode = {
  code: string,
  label: string,
}

export type SessionLineSelecttProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (code: IItemCode) => void;
  className?: string
}
// 0-全部,1-盘前;2-盘中;3-盘后;5-夜盘
const SessionLineSelectt = memo(
  ({
    defaultValue,
    value, 
    onChange, 
    className
  }: SessionLineSelecttProps) => {
    const { t, i18n } = useTranslation()
    const dataList = useMemo(() => {
      return [
        { code: '0', label: t('v3.t26')},
        { code: '1', label: t('v3.t27')},
        { code: '2', label: t('v3.t28')},
        { code: '3', label: t('v3.t29')},
        
      ]
    }, [t]) 
    const [currentCode, setCurrentCode] = useState(dataList[0].code)
    const [currentItem, setCurrentItem] = useState(dataList[0])
    const [open, setOpen] = useState(false)

    const currentLabel = useMemo(() => {
      const item = dataList.find(id => id.code === currentCode)
      return item?.label || ''
    }, [dataList, currentCode])

    useEffect(() => {
      if (defaultValue) {
        setCurrentCode(defaultValue)
        const _id = dataList.find(id => id.code === defaultValue)
        if (_id) {
          setCurrentItem(_id)
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
        <SelectTrigger 
          open={open}
          className={cn(
            "px-[10px] py-0 h-[23px] shadow-none flex items-center justify-between rounded-[4px] border border-solid border-[#232427]",
            className,
          )}
        >
          <div className="flex items-center gap-2 w-[110px] text-[#9DA3AF] text-[12px]">
            {currentCode ? (
              <span className=" font-normal">{currentLabel}</span>
            ) : (
              <span className="text-5">{''}</span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className=" ">
          {dataList.map(id => (
            <SelectItem key={id.code} value={id.code} className="h-[23px]">
              <div className="flex items-center justify-between w-full gap-2 text-white text-[12px]">
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

export { SessionLineSelectt }



