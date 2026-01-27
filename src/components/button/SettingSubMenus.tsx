import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/useTranslation";
import { languages } from "@/i18n";
import { cn } from "@/utils";
import storage from "@/utils/storage";
import { lazy, useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { LazyImage } from "../image/LazyImage";
import { Switch } from "../ui/switch-label";
import { useSettingStore } from "@/stores/settingStore";

export function LanguageItem({
  title,
  selected,
  onClick
}: {
  title?: string;
  selected?: boolean;
  onClick?: () => void
}) {
  return (
    <div 
      onClick={() => onClick && onClick()}
      className={cn(
      "flex items-center justify-between py-3 cursor-pointer font-medium text-white",
    )}>
      <span className="text-[14px]">{title}</span>
      {
        selected && <img src="/images/icons/selected.png" className="w-3" alt="" />
      }
    </div>
  )
}

export function SettingSubMenus({
  from
}: {from?: string}) {
  const { t, i18n } = useTranslation();
  const showConfirm = useSettingStore(state => state.showConfirm)
  const setShowConfirm = useSettingStore(state => state.setShowConfirm)

  const [open, setOpen] = useState(false)
  
  return (
    <HoverCard
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
      }}
    >
      <HoverCardTrigger asChild>
        <div className=" flex items-center shrink-0">
          <button className={cn(
            "cursor-pointer bg-[#191B1E] rounded-[8px] p-[6px] w-[36px] h-[36px] flex justify-center",
            open ? "bg-[#383A40]" : ""
          )}>
            <img src="/images/v2/icons/setting.png" className={cn(
              "w-[24px] h-[24px] lg:w-6 lg:h-6",
              from === 'home' ? ' rounded-full' : ''
            )} alt="" />
          </button>
        </div>
      </HoverCardTrigger>
       <HoverCardContent align="end" 
          className="bg-[rgba(0,0,0,0)] w-[240px] border-none pt-2 -mr-[16px]"
       >
        <div 
          className="bg-[#131416] border border-[#232427] rounded-[8px] text-white text-[14px] font-medium relative"
          style={{boxShadow: '0px 5px 15px 0px rgba(0,0,0,0.25)'}}
        >
          <div className="h-[50px] w-[50px] absolute right-0 -top-[50px] bg-[rgba(0,0,0,0)]"></div>
          <div className=" px-5 py-2">
            <div className="flex items-center justify-between py-3 cursor-pointer"
            >
              <span className="">{t('v2.hd.h3')}</span>
              <div>
                <Switch 
                  checked={showConfirm}
                  onCheckedChange={checked => {
                    setShowConfirm(checked)
                  }} 
                  checkedLabel="ON" uncheckedLabel="OFF" 
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-3 cursor-pointer"
            >
              <span className="">{t('v2.hd.h4')}</span>
              <div className="flex items-center gap-x-1">
                <LazyImage src="/images/icons/chains/bsc.png" className="w-4 h-4" />
                <span>BNB</span>
              </div>
            </div>
          </div>
          
        </div>
        
      </HoverCardContent>
      
    </HoverCard>
  )
}