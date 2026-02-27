

import { Select as SelectCom, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { memo, useEffect, useState } from "react";

export type ItemProps = {
  value: string,
  label: string
}

export type CountrySelectProps = {
  defaultValue?: string;
  value?: string;
  data?: ItemProps[];
  placeholder?: string
  onChange?: (item: ItemProps) => void;
  className?: string;
  activeColor?: string
}

const Select = memo(
  ({
    defaultValue,
    value, 
    data = [],
    placeholder,
    onChange, 
    className,
    activeColor
  }: CountrySelectProps) => {
    const [curretnValue, setCurrentValue] = useState('')
    const [currentItem, setCurrentItem] = useState<ItemProps | null>(null)
    const [open, setOpen] = useState(false)
    
    useEffect(() => {
      if (defaultValue) {
        setCurrentValue(defaultValue)
        const _current = data.find(item => item.value === defaultValue)
        if (_current) {
          setCurrentItem(_current)
        }
      }
    }, [defaultValue, data]) 

    return (
      <SelectCom 
        value={value} 
        onOpenChange={open => {
          setOpen(open)
        }}
        onValueChange={(value) => {
          if (value) {
            setCurrentValue(value)
            const item = data.find(item => item.value === value)
            if (item) {
              setCurrentItem(item)
              onChange && onChange(item)
            }
          }
          
        }}
      >
        <SelectTrigger 
          open={open}
          className={cn(
            "px-3 py-0 h-[38px] shadow-none flex items-center justify-between rounded-[4px] bg-[#1A1B1E] border border-solid border-[rgba(255,255,255,0)]",
            className,
            open ? 'border-[rgba(156,255,58,0.5)]' : ''
          )}
          style={{borderColor: open ? activeColor ? activeColor : '' : ''}}
        >
          <div className="flex items-center gap-2 w-[70px] text-white">
            {currentItem ? (
              <span className=" font-normal md:text-[14px]">{currentItem?.label}</span>
            ) : (
              <span className="text-[14px] text-5 text-[rgba(255,255,255,0.3)]">{placeholder ?? ''}</span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className="">
          {data.map(item => (
            <SelectItem key={item.value} value={item.value} className="h-[34px]">
              <div className="flex items-center justify-between gap-2 text-white text-[14px] w-full">
                <span>{item.label}</span>
                {
                  item.value === curretnValue && <img src="/images/icons/item_selected.png" className="w-[12px]" alt="" />
                }
              </div>
              
            </SelectItem>
          ))}
        </SelectContent>
      </SelectCom>
    )
  }
)

export { Select }





