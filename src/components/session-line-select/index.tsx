

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
  selected?: boolean
  language?: string
}
// 0-全部,1-盘前;2-盘中;3-盘后;5-夜盘
const SessionLineSelectt = memo(
  ({
    defaultValue,
    onChange, 
    className,
    selected,
    language
  }: SessionLineSelecttProps) => {
    const { t, i18n } = useTranslation()
    const [value, setValue] = useState<string>('0')
    const dataList = useMemo(() => {
      return [
        { code: '0', label: t('v3.t26')},
        { code: '1', label: t('v3.t27')},
        { code: '2', label: t('v3.t28')},
        { code: '3', label: t('v3.t29')},
        { code: '5', label: t('v3.t34')},
        
      ]
    }, [t]) 
    const [currentCode, setCurrentCode] = useState(dataList[0].code)
    const [open, setOpen] = useState(false)

    const currentLabel = useMemo(() => {
      const item = dataList.find(id => id.code === currentCode)
      return item?.label || ''
    }, [dataList, currentCode])

    useEffect(() => {
      setValue('')
      setCurrentCode(dataList[0].code) 
    }, [i18n.language]) 

    useEffect(() => {
      if (!selected) {
        setValue('')
      }
    }, [selected])

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
              setValue(_id.code)
              onChange && onChange(_id)
            }
          }
          
        }}
      >
        <SelectTrigger 
          open={open}
          className={cn(
            "px-[10px] py-0 h-[23px] shadow-none flex items-center justify-between rounded-[4px] border border-solid ",
            className,
            selected ? "text-[#ffffff] border-[#FFFFFF]" : "border-[#232427] "
          )}
        >
          <div className={cn(
            "flex items-center gap-2 w-[110px] text-[12px]",
          )}>
            {currentCode ? (
              <span className={cn(
                " font-normal",
                selected ? "text-white" : "text-[#9DA3AF] "
              )}>{currentLabel}</span>
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
                  data-state={id.code === currentCode && selected ? 'checked' : ''}
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



