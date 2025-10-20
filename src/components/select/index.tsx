

import { Select as SelectCom, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { memo, useEffect, useState } from "react";

export type ItemProps = {
  value: string,
  label: string
}

export type CountrySelectProps = {
  defaultValue?: string;
  value?: string;
  data?: ItemProps[];
  onChange?: (item: ItemProps) => void;
  className?: string;
}

const Select = memo(
  ({
    defaultValue,
    value, 
    data = [],
    onChange, 
    className
  }: CountrySelectProps) => {
    const [curretnValue, setCurrentValue] = useState('')
    const [currentItem, setCurrentItem] = useState<ItemProps | null>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
      if (defaultValue) {
        setCurrentValue(defaultValue)
      }
    }, [defaultValue]) 

    return (
      <SelectCom 
        value={value} 
        onOpenChange={open => {
          setOpen(open)
        }}
        onValueChange={(value) => {
          setCurrentValue(value)
          const item = data.find(item => item.value === value)
          if (item) {
            setCurrentItem(item)
            onChange && onChange(item)
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
            {currentItem ? (
              <span className=" font-normal md:text-[16px]">{currentItem?.label}</span>
            ) : (
              <span className="md:text-[1.04vw] text-5">Select</span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className=" border-none">
          {data.map(item => (
            <SelectItem key={item.value} value={item.value}>
              <div className="flex items-center justify-between gap-2 text-white text-[16px] w-full">
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





